package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"regexp"
	"strconv"
	"strings"
	"time"
	"unicode"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	"golang.org/x/text/runes"
	"golang.org/x/text/transform"
	"golang.org/x/text/unicode/norm"

	"github.com/golang-jwt/jwt/v5"
	"github.com/supabase-community/auth-go"
	"github.com/supabase-community/auth-go/types"
)

// ================================
// Config & Globals
// ================================

type Config struct {
	DatabaseURL  string
	SupabaseURL  string
	JWTSecret    string
	AllowOrigins []string
}

var (
	cfg        Config
	db         *pgxpool.Pool
	authClient auth.Client
)

// ================================
// Modelos
// ================================

// NOVOS MODELOS para o payload do Webhook do Supabase
type SupabaseWebhookPayload struct {
	Type   string    `json:"type"`
	Record UserModel `json:"record"`
}

type UserModel struct {
	ID              string         `json:"id"`
	Email           string         `json:"email"`
	RawUserMetaData UserMetaData `json:"raw_user_meta_data"`
}

type UserMetaData struct {
	FullName string `json:"full_name"`
	Role     string `json:"role"`
}


type AnswerAnalysisRequest struct {
	Answer string `json:"answer"`
}
// ... (outros modelos permanecem os mesmos) ...
type AnswerAnalysisResponse struct {
	Status   string `json:"status"`
	Feedback string `json:"feedback"`
}
type AnalysisRules struct {
	MinRequiredConcepts int `json:"minRequiredConcepts"`
	ConceptGroups       []struct {
		Name     string   `json:"name"`
		Keywords []string `json:"keywords"`
	} `json:"conceptGroups"`
	Validation struct {
		Type            string   `json:"type,omitempty"`
		Target          int      `json:"target,omitempty"`
		OrderedConcepts []string `json:"orderedConcepts,omitempty"`
	} `json:"validation,omitempty"`
	SocraticHints map[string]string `json:"socratic_hints"`
	Feedbacks     struct {
		Completo string `json:"completo"`
		Baixo    string `json:"baixo"`
	} `json:"feedbacks"`
}
type Activity struct {
	ID              string          `json:"id"`
	PillarID        string          `json:"pillar_id"`
	LevelID         int             `json:"level_id"`
	Title           string          `json:"title"`
	Description     string          `json:"description"`
	Question        string          `json:"question"`
	Ajuda           json.RawMessage `json:"ajuda"`
	AnaliseResposta json.RawMessage `json:"analise_resposta"`
	CreatedAt       time.Time       `json:"created_at"`
}
type ProgressInput struct {
	StudentID     string `json:"student_id"`
	ActivityID    string `json:"activity_id" binding:"required"`
	Status        string `json:"status" binding:"required"`
	HelpLevel     int    `json:"help_level"`
	StudentAnswer string `json:"student_answer"`
	FeedbackGiven string `json:"feedback_given"`
}
type ProgressRecord struct {
	ActivityID    string    `json:"activity_id"`
	Status        string    `json:"status"`
	HelpLevel     int       `json:"help_level"`
	StudentAnswer string    `json:"student_answer"`
	FeedbackGiven string    `json:"feedback_given"`
	SubmittedAt   time.Time `json:"submitted_at"`
	StudentID     string    `json:"student_id,omitempty"`
}
type UserCredentials struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}
type RegisterRequest struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
	FullName string `json:"full_name" binding:"required"`
	Role     string `json:"role" binding:"required"`
}
type Pillar struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}
type Level struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}
type Class struct {
	ID         string `json:"id"`
	Name       string `json:"name"`
	Grade      string `json:"grade"`
	SchoolYear int    `json:"school_year"`
}
type StudentProfile struct {
	UserID   string `json:"user_id"`
	FullName string `json:"full_name"`
	Email    string `json:"email"`
}
type UserProfile struct {
	ID       string `json:"id"`
	FullName string `json:"full_name"`
	Role     string `json:"role"`
	Email    string `json:"email"`
}

// ================================
// Helpers
// ================================
// ... (helpers permanecem os mesmos) ...
func normalizeText(s string) string {
	t := transform.Chain(norm.NFD, runes.Remove(runes.In(unicode.Mn)), norm.NFC)
	result, _, _ := transform.String(t, s)
	return strings.ToLower(result)
}
func loadConfig() Config {
	if err := godotenv.Load(); err != nil {
		log.Println("Aviso: não foi possível carregar o arquivo .env")
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		log.Fatal("A variável de ambiente JWT_SECRET é obrigatória.")
	}

	return Config{
		DatabaseURL:  os.Getenv("DATABASE_URL"),
		SupabaseURL:  os.Getenv("SUPABASE_URL"),
		JWTSecret:    jwtSecret,
		AllowOrigins: strings.Split(os.Getenv("ALLOW_ORIGINS"), ","),
	}
}
func connectDB(ctx context.Context, url string) *pgxpool.Pool {
	if url == "" {
		log.Fatal("DATABASE_URL não definido")
	}
	cfg, err := pgxpool.ParseConfig(url)
	if err != nil {
		log.Fatalf("Erro ao parsear DATABASE_URL: %v", err)
	}

	cfg.ConnConfig.DefaultQueryExecMode = pgx.QueryExecModeSimpleProtocol

	cfg.ConnConfig.RuntimeParams["standard_conforming_strings"] = "on"
	cfg.ConnConfig.RuntimeParams["application_name"] = "decifra-backend"

	pool, err := pgxpool.NewWithConfig(ctx, cfg)
	if err != nil {
		log.Fatalf("Erro ao criar pool do Postgres: %v", err)
	}
	ctxPing, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	if err := pool.Ping(ctxPing); err != nil {
		log.Fatalf("Falha ao conectar no banco: %v", err)
	}
	log.Println("Conectado ao banco de dados com sucesso!")
	return pool
}
func setupAuth() {
	supabaseURL := os.Getenv("SUPABASE_URL")
	supabaseServiceKey := os.Getenv("SUPABASE_SERVICE_KEY")
	authClient = auth.New(supabaseURL, supabaseServiceKey)
	log.Println("Cliente de Autenticação Supabase inicializado com sucesso!")
}
func isTeacherInClass(ctx context.Context, teacherID string, classID string) (bool, error) {
	var exists bool
	query := `
		SELECT EXISTS (
			SELECT 1
			FROM public.class_members
			WHERE user_id = $1 AND class_id = $2 AND role = 'Professor'
		)
	`
	err := db.QueryRow(ctx, query, teacherID, classID).Scan(&exists)
	if err != nil {
		return false, err
	}
	return exists, nil
}
// ================================
// JWT / Auth
// ================================

func requireAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Bearer token ausente"})
			return
		}
		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")

		claims := jwt.MapClaims{}
		token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, errors.New("algoritmo de assinatura inesperado")
			}
			return []byte(cfg.JWTSecret), nil
		})

		if err != nil {
			log.Printf("Erro ao validar token: %v", err)
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token inválido ou expirado"})
			return
		}

		if !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
			return
		}

		userID, ok := claims["sub"].(string)
		if !ok || userID == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token sem ID do usuário"})
			return
		}
		c.Set("user_id", userID)
		c.Next()
	}
}

// ================================
// Handlers
// ================================

// ... (outros handlers permanecem os mesmos) ...

// --- NOVO HANDLER ---
// Este handler é chamado pelo Webhook do Supabase quando um novo usuário é inserido na tabela 'auth.users'.
func handleNewUserWebhook(c *gin.Context) {
	var payload SupabaseWebhookPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		log.Printf("Erro ao decodificar payload do webhook: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Payload inválido"})
		return
	}

	// Processamos apenas eventos de INSERT
	if payload.Type != "INSERT" {
		c.JSON(http.StatusOK, gin.H{"message": "Evento ignorado, não é INSERT"})
		return
	}

	newUser := payload.Record
	metaData := newUser.RawUserMetaData

	log.Printf("Webhook de novo usuário recebido: ID=%s, Email=%s, Nome=%s, Role=%s",
		newUser.ID, newUser.Email, metaData.FullName, metaData.Role)

	// Inicia uma transação para garantir que todas as inserções ocorram ou nenhuma ocorra.
	tx, err := db.Begin(context.Background())
	if err != nil {
		log.Printf("Erro ao iniciar transação: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	defer tx.Rollback(context.Background()) // Garante que a transação seja desfeita em caso de erro

	// 1. Insere na tabela 'public.users'
	sql := "INSERT INTO public.users (id, full_name, role) VALUES ($1, $2, $3)"
	_, err = tx.Exec(context.Background(), sql, newUser.ID, metaData.FullName, metaData.Role)
	if err != nil {
		log.Printf("Erro ao inserir em public.users: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao salvar perfil do usuário"})
		return
	}

	// 2. Insere na tabela específica de 'students' ou 'teachers' com base na role
	switch metaData.Role {
	case "Estudante":
		_, err = tx.Exec(context.Background(), "INSERT INTO public.students (user_id) VALUES ($1)", newUser.ID)
	case "Professor":
		_, err = tx.Exec(context.Background(), "INSERT INTO public.teachers (user_id) VALUES ($1)", newUser.ID)
	default:
		log.Printf("Role desconhecida para o usuário %s: %s", newUser.ID, metaData.Role)
		// Podemos decidir se isso é um erro ou não. Por enquanto, apenas logamos.
	}

	if err != nil {
		log.Printf("Erro ao inserir em tabela de role específica: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao salvar perfil específico do usuário"})
		return
	}

	// Se tudo deu certo, confirma a transação
	if err := tx.Commit(context.Background()); err != nil {
		log.Printf("Erro ao commitar transação: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	log.Printf("Usuário %s processado com sucesso pelo webhook.", newUser.ID)
	c.JSON(http.StatusCreated, gin.H{"message": "Usuário processado com sucesso"})
}
func healthHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}
func getUserProfile(c *gin.Context) {
	userID := c.GetString("user_id")

	var userProfile UserProfile
	query := `
		SELECT u.id, u.full_name, u.role, a.email
		FROM public.users u
		JOIN auth.users a ON u.id = a.id
		WHERE u.id = $1
	`
	err := db.QueryRow(context.Background(), query, userID).Scan(&userProfile.ID, &userProfile.FullName, &userProfile.Role, &userProfile.Email)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Perfil do usuário não encontrado"})
			return
		}
		log.Printf("Erro ao buscar perfil do usuário: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar perfil do usuário"})
		return
	}

	c.JSON(http.StatusOK, userProfile)
}
func analyzeAnswerHandler(c *gin.Context) {
	activityID := c.Param("activityId")

	var req AnswerAnalysisRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Corpo da requisição inválido"})
		return
	}

	var rulesJSON json.RawMessage
	query := "SELECT analise_resposta FROM public.activities WHERE id = $1"
	err := db.QueryRow(context.Background(), query, activityID).Scan(&rulesJSON)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Atividade não encontrada"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar regras da atividade"})
		return
	}

	var rules AnalysisRules
	if err := json.Unmarshal(rulesJSON, &rules); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao processar regras de análise"})
		return
	}

	studentAnswerNormalized := normalizeText(req.Answer)
	foundConcepts := make(map[string]bool)
	var foundConceptsInOrder []string

	for _, group := range rules.ConceptGroups {
		for _, keyword := range group.Keywords {
			if strings.Contains(studentAnswerNormalized, normalizeText(keyword)) {
				if !foundConcepts[group.Name] {
					foundConcepts[group.Name] = true
					if rules.Validation.Type == "sequence" {
						foundConceptsInOrder = append(foundConceptsInOrder, group.Name)
					}
				}
				break
			}
		}
	}

	isValid := len(foundConcepts) >= rules.MinRequiredConcepts
	validationError := ""

	if rules.Validation.Type == "sum" {
		re := regexp.MustCompile(`-?\d+`)
		numbersStr := re.FindAllString(req.Answer, -1)
		totalSum := 0
		for _, numStr := range numbersStr {
			num, _ := strconv.Atoi(numStr)
			totalSum += num
		}
		if isValid && totalSum > rules.Validation.Target {
			validationError = fmt.Sprintf("Suas categorias estão ótimas! Mas notei que a soma dos valores (R$ %d) ultrapassou o orçamento de R$ %d. Que tal ajustar os custos?", totalSum, rules.Validation.Target)
			isValid = false
		}
	}

	if rules.Validation.Type == "sequence" {
		lastFoundIndex := -1
		isSequenceCorrect := true
		conceptIndexMap := make(map[string]int)
		for i, concept := range rules.Validation.OrderedConcepts {
			conceptIndexMap[concept] = i
		}

		for _, concept := range foundConceptsInOrder {
			currentIndex, ok := conceptIndexMap[concept]
			if !ok {
				continue
			}
			if currentIndex < lastFoundIndex {
				isSequenceCorrect = false
				break
			}
			lastFoundIndex = currentIndex
		}
		if !isSequenceCorrect {
			validationError = "Os passos que você listou são todos importantes, mas a ordem parece um pouco trocada. Lembre-se, o que precisa acontecer primeiro para que o próximo passo seja possível?"
			isValid = false
		}
	}

	var response AnswerAnalysisResponse
	if isValid && validationError == "" {
		response.Status = "done"
		response.Feedback = rules.Feedbacks.Completo
	} else {
		response.Status = "pending"
		if validationError != "" {
			response.Feedback = validationError
		} else {
			praise := ""
			if len(foundConcepts) > 0 {
				var concepts []string
				for concept := range foundConcepts {
					concepts = append(concepts, concept)
				}
				praise = fmt.Sprintf("Excelente! Você já identificou conceitos importantes como **%s**. ", strings.Join(concepts, ", "))
			}

			var nextHint string
			var searchOrder []string
			if rules.Validation.Type == "sequence" {
				searchOrder = rules.Validation.OrderedConcepts
			} else {
				for _, group := range rules.ConceptGroups {
					searchOrder = append(searchOrder, group.Name)
				}
			}

			for _, conceptName := range searchOrder {
				if !foundConcepts[conceptName] {
					if hint, ok := rules.SocraticHints[conceptName]; ok {
						nextHint = hint
						break
					}
				}
			}
			if nextHint == "" {
				nextHint = "Sua análise está quase perfeita, continue refinando!"
			}

			response.Feedback = praise + nextHint
		}
	}

	c.JSON(http.StatusOK, response)
}
func getActivities(c *gin.Context) {
	pillarID := c.Query("pillar_id")
	levelIDStr := c.Query("level_id")

	baseQuery := `
		SELECT id::text, pillar_id, level_id, title, description, question,
		       COALESCE(ajuda, '{}')::text,
		       COALESCE(analise_resposta, '{}')::text,
		       created_at
		FROM public.activities
	`
	conditions := make([]string, 0)
	args := make([]interface{}, 0)
	paramIndex := 1

	if pillarID != "" {
		conditions = append(conditions, fmt.Sprintf("pillar_id = $%d", paramIndex))
		args = append(args, pillarID)
		paramIndex++
	}

	if levelIDStr != "" {
		levelID, err := strconv.Atoi(levelIDStr)
		if err == nil {
			conditions = append(conditions, fmt.Sprintf("level_id = $%d", paramIndex))
			args = append(args, levelID)
			paramIndex++
		}
	}

	query := baseQuery
	if len(conditions) > 0 {
		query += " WHERE " + strings.Join(conditions, " AND ")
	}

	query += " ORDER BY created_at DESC, id"

	log.Printf("Executando query de atividades: %s com args: %v", query, args)

	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	rows, err := db.Query(ctx, query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar atividades: " + err.Error()})
		return
	}
	defer rows.Close()

	list := make([]Activity, 0)
	for rows.Next() {
		var a Activity
		if err := rows.Scan(&a.ID, &a.PillarID, &a.LevelID, &a.Title, &a.Description, &a.Question, &a.Ajuda, &a.AnaliseResposta, &a.CreatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao escanear atividade: " + err.Error()})
			return
		}
		list = append(list, a)
	}

	if rows.Err() != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro nas linhas do resultado: " + rows.Err().Error()})
		return
	}

	c.JSON(http.StatusOK, list)
}
func getPillars(c *gin.Context) {
	rows, err := db.Query(context.Background(), "SELECT id, name FROM public.pillars ORDER BY id")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar pilares do banco de dados"})
		return
	}
	defer rows.Close()

	pillars := make([]Pillar, 0)
	for rows.Next() {
		var p Pillar
		if err := rows.Scan(&p.ID, &p.Name); err != nil {
			log.Printf("Erro ao escanear pilar: %v", err)
			continue
		}
		pillars = append(pillars, p)
	}
	c.JSON(http.StatusOK, pillars)
}
func getLevels(c *gin.Context) {
	rows, err := db.Query(context.Background(), "SELECT id, name FROM public.levels ORDER BY id")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar níveis do banco de dados"})
		return
	}
	defer rows.Close()

	levels := make([]Level, 0)
	for rows.Next() {
		var l Level
		if err := rows.Scan(&l.ID, &l.Name); err != nil {
			log.Printf("Erro ao escanear nível: %v", err)
			continue
		}
		levels = append(levels, l)
	}
	c.JSON(http.StatusOK, levels)
}
func getStudentProgress(c *gin.Context) {
	studentId := c.Param("studentId")

	tokenUserId := c.GetString("user_id")
	if tokenUserId != studentId {
		c.JSON(http.StatusForbidden, gin.H{"error": "Acesso não autorizado"})
		return
	}

	query := `
		SELECT activity_id, status, help_level, student_answer, feedback_given, submitted_at
		FROM public.progress
		WHERE student_id = $1
	`
	rows, err := db.Query(context.Background(), query, studentId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar progresso do aluno"})
		return
	}
	defer rows.Close()

	progressRecords := make([]ProgressRecord, 0)
	for rows.Next() {
		var p ProgressRecord
		if err := rows.Scan(&p.ActivityID, &p.Status, &p.HelpLevel, &p.StudentAnswer, &p.FeedbackGiven, &p.SubmittedAt); err != nil {
			log.Printf("Erro ao escanear progresso: %v", err)
			continue
		}
		progressRecords = append(progressRecords, p)
	}
	c.JSON(http.StatusOK, progressRecords)
}
func postProgress(c *gin.Context) {
	var p ProgressInput
	if err := c.ShouldBindJSON(&p); err != nil {
		log.Printf("Erro ao fazer bind do JSON: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "JSON inválido"})
		return
	}

	studentID := c.GetString("user_id")
	if studentID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "ID do usuário não encontrado no token"})
		return
	}

	if p.ActivityID == "" || p.Status == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "activity_id e status são obrigatórios"})
		return
	}

	if p.Status != "pending" && p.Status != "done" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "status deve ser 'pending' ou 'done'"})
		return
	}

	log.Printf("Insert/Upsert progress: student_id=%s, activity_id=%s, status=%s",
		studentID, p.ActivityID, p.Status)

	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()

	const q = `
		INSERT INTO public.progress
			(student_id, activity_id, status, help_level, student_answer, feedback_given, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, NOW())
		ON CONFLICT (student_id, activity_id) DO UPDATE
			SET status = EXCLUDED.status,
				help_level = EXCLUDED.help_level,
				student_answer = EXCLUDED.student_answer,
				feedback_given = EXCLUDED.feedback_given,
				updated_at = NOW()
		RETURNING id::text;
	`

	var id string
	err := db.QueryRow(ctx, q, studentID, p.ActivityID, p.Status, p.HelpLevel, p.StudentAnswer, p.FeedbackGiven).Scan(&id)
	if err != nil {
		log.Printf("Insert/Upsert progress: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	log.Printf("Progresso salvo com sucesso: id=%s", id)
	c.JSON(http.StatusOK, gin.H{"id": id, "message": "Progresso salvo"})
}
func deleteProgressByStudent(c *gin.Context) {
	paramID := c.Param("studentId")
	if paramID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "studentId ausente"})
		return
	}

	tokenUserId := c.GetString("user_id")
	if tokenUserId == "" || tokenUserId != paramID {
		c.JSON(http.StatusForbidden, gin.H{"error": "não é permitido deletar progresso de outro aluno"})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()
	cmd, err := db.Exec(ctx, `DELETE FROM public.progress WHERE student_id = $1`, paramID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": cmd.RowsAffected(), "message": "Progresso do aluno reiniciado com sucesso!"})
}

// ===================================
// Handlers do Professor
// ===================================
func getTeacherClasses(c *gin.Context) {
	teacherID := c.GetString("user_id")

	query := `
		SELECT c.id, c.name, c.grade, c.school_year
		FROM public.classes c
		JOIN public.class_members cm ON c.id = cm.class_id
		WHERE cm.user_id = $1 AND cm.role = 'Professor'
	`
	rows, err := db.Query(context.Background(), query, teacherID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar turmas do professor"})
		return
	}
	defer rows.Close()

	classes := make([]Class, 0)
	for rows.Next() {
		var cl Class
		if err := rows.Scan(&cl.ID, &cl.Name, &cl.Grade, &cl.SchoolYear); err != nil {
			log.Printf("Erro ao escanear turma: %v", err)
			continue
		}
		classes = append(classes, cl)
	}
	c.JSON(http.StatusOK, classes)
}
func getStudentsByClass(c *gin.Context) {
	teacherID := c.GetString("user_id")
	classID := c.Param("classId")

	isMember, err := isTeacherInClass(context.Background(), teacherID, classID)
	if err != nil || !isMember {
		c.JSON(http.StatusForbidden, gin.H{"error": "Acesso não autorizado a esta turma"})
		return
	}

	query := `
		SELECT u.id, u.full_name, a.email
		FROM public.users u
		JOIN public.class_members cm ON u.id = cm.user_id
		JOIN auth.users a ON u.id = a.id
		WHERE cm.class_id = $1 AND u.role = 'Estudante'
	`
	rows, err := db.Query(context.Background(), query, classID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar alunos da turma"})
		return
	}
	defer rows.Close()

	students := make([]StudentProfile, 0)
	for rows.Next() {
		var s StudentProfile
		if err := rows.Scan(&s.UserID, &s.FullName, &s.Email); err != nil {
			log.Printf("Erro ao escanear aluno: %v", err)
			continue
		}
		students = append(students, s)
	}
	c.JSON(http.StatusOK, students)
}
func getStudentProgressByClass(c *gin.Context) {
	teacherID := c.GetString("user_id")
	classID := c.Param("classId")

	isMember, err := isTeacherInClass(context.Background(), teacherID, classID)
	if err != nil || !isMember {
		c.JSON(http.StatusForbidden, gin.H{"error": "Acesso não autorizado a esta turma"})
		return
	}

	query := `
		SELECT p.student_id, p.activity_id, p.status, p.help_level, p.student_answer, p.feedback_given, p.submitted_at
		FROM public.progress p
		JOIN public.class_members cm ON p.student_id = cm.user_id
		WHERE cm.class_id = $1
	`
	rows, err := db.Query(context.Background(), query, classID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar progresso da turma"})
		return
	}
	defer rows.Close()

	progressRecords := make([]ProgressRecord, 0)
	for rows.Next() {
		var p ProgressRecord
		if err := rows.Scan(&p.StudentID, &p.ActivityID, &p.Status, &p.HelpLevel, &p.StudentAnswer, &p.FeedbackGiven, &p.SubmittedAt); err != nil {
			log.Printf("Erro ao escanear progresso: %v", err)
			continue
		}
		progressRecords = append(progressRecords, p)
	}
	c.JSON(http.StatusOK, progressRecords)
}


// ================================
// Boot
// ================================

func main() {
	cfg = loadConfig()
	db = connectDB(context.Background(), cfg.DatabaseURL)
	setupAuth()
	defer db.Close()

	router := gin.Default()
	router.Use(cors.New(cors.Config{
		AllowOrigins:     cfg.AllowOrigins,
		AllowMethods:     []string{"GET", "POST", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	router.GET("/health", healthHandler)

	authRoutes := router.Group("/auth")
	{
		// --- HANDLER DE REGISTRO SIMPLIFICADO ---
		authRoutes.POST("/register", func(c *gin.Context) {
			var req RegisterRequest
			if err := c.ShouldBindJSON(&req); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Dados de cadastro inválidos"})
				return
			}

			// A única responsabilidade agora é chamar o signUp do Supabase.
			// Os dados de nome e role são passados como metadados.
			_, err := authClient.Signup(types.SignupRequest{
				Email:    req.Email,
				Password: req.Password,
				Data: map[string]interface{}{
					"full_name": req.FullName,
					"role":      req.Role,
				},
			})
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar usuário: " + err.Error()})
				return
			}
			
			// REMOVEMOS a lógica de inserção no banco de dados daqui.
			// Isso agora será feito pelo handler do webhook.
			
			c.JSON(http.StatusCreated, gin.H{"message": "Usuário cadastrado com sucesso! Verifique seu e-mail."})
		})

		authRoutes.POST("/login", func(c *gin.Context) {
			var req UserCredentials
			if err := c.ShouldBindJSON(&req); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Credenciais inválidas"})
				return
			}

			loginData, err := authClient.Token(types.TokenRequest{
				GrantType: "password",
				Email:     req.Email,
				Password:  req.Password,
			})
			if err != nil {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "E-mail ou senha incorretos"})
				return
			}

			c.JSON(http.StatusOK, loginData)
		})
	}

	api := router.Group("/api/v1")
	{
		api.GET("/activities", getActivities)
		api.POST("/activities/:activityId/analyze", requireAuth(), analyzeAnswerHandler)
		api.GET("/pillars", getPillars)
		api.GET("/levels", getLevels)
		api.GET("/progress/student/:studentId", requireAuth(), getStudentProgress)
		api.POST("/progress", requireAuth(), postProgress)
		api.DELETE("/progress/student/:studentId", requireAuth(), deleteProgressByStudent)
	}

	authApi := router.Group("/api/v1/auth")
	authApi.Use(requireAuth())
	{
		authApi.GET("/me", getUserProfile)
	}

	// --- NOVO GRUPO de rotas para Webhooks ---
	hookApi := router.Group("/api/v1/hooks")
	{
		// Esta rota é pública para que o Supabase possa acessá-la.
		hookApi.POST("/handle-new-user", handleNewUserWebhook)
	}


	teacherApi := router.Group("/api/v1/teacher")
	teacherApi.Use(requireAuth())
	{
		teacherApi.GET("/classes", getTeacherClasses)
		teacherApi.GET("/classes/:classId/students", getStudentsByClass)
		teacherApi.GET("/classes/:classId/progress", getStudentProgressByClass)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	addr := ":" + port
	log.Printf("Servidor iniciado e ouvindo em %s (modo=%s)", addr, gin.Mode())
	log.Println("Rotas de autenticação disponíveis em /auth/login e /auth/register")
	if err := router.Run(addr); err != nil && !errors.Is(err, http.ErrServerClosed) {
		log.Fatalf("Erro ao iniciar o servidor: %v", err)
	}
}