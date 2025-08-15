package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/jackc/pgx/v5/pgxpool"

	// JWT + JWKS
	"github.com/golang-jwt/jwt/v4"
	"github.com/MicahParks/keyfunc"
)

// ================================
// Versão / Metadados de build
// (são sobrescrevíveis via -ldflags no build)
// ================================
var (
	version = "v0.4.0+branch.mvp-implementacao"
	commit  = "dev"
	builtAt = "local"
)

// ================================
// Config & Globals
// ================================

type Config struct {
	DatabaseURL  string
	SupabaseURL  string
	AllowOrigins []string
}

var (
	cfg         Config
	db          *pgxpool.Pool
	jwksKeyFunc jwt.Keyfunc // se != nil, valida tokens RS256 vindos do Supabase
)

// ================================
// Modelos
// ================================

type Activity struct {
	ID              string    `json:"id"`
	Pillar          string    `json:"pillar"`
	Level           int       `json:"level"`
	Title           string    `json:"title"`
	Description     string    `json:"description"`
	Question        string    `json:"question"`
	AjudaJSON       string    `json:"ajuda"`
	AnaliseRespJSON string    `json:"analise_resposta"`
	CreatedAt       time.Time `json:"created_at"`
}

type ProgressPayload struct {
	// IMPORTANTE: no modo PRO (JWKS ativo) ignoramos StudentID do payload e usamos o sub do token
	StudentID     string `json:"student_id"`  // requerido somente quando JWKS estiver DESLIGADO (desenvolvimento)
	ActivityID    string `json:"activity_id"` // uuid da atividade
	Status        string `json:"status"`      // "pending" | "done"
	HelpLevel     int    `json:"help_level"`
	StudentAnswer string `json:"student_answer"`
	FeedbackGiven string `json:"feedback_given"`
}

// ================================
// Helpers
// ================================

func mustGetEnv(k, def string) string {
	v := os.Getenv(k)
	if v == "" {
		return def
	}
	return v
}

func loadConfig() Config {
	_ = godotenv.Load() // opcional: carrega .env se existir

	allow := mustGetEnv("ALLOW_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
	origins := []string{}
	for _, o := range strings.Split(allow, ",") {
		o = strings.TrimSpace(o)
		if o != "" {
			origins = append(origins, o)
		}
	}

	return Config{
		DatabaseURL:  mustGetEnv("DATABASE_URL", ""),
		SupabaseURL:  mustGetEnv("SUPABASE_URL", ""),
		AllowOrigins: origins,
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
	// Evita problemas de prepared statements em alguns proxies
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

// ================================
// JWT / Auth
// ================================

// enableJWKS agora é obrigatório: se falhar, o servidor não sobe.
func enableJWKS() {
  if cfg.SupabaseURL == "" {
    log.Fatal("SUPABASE_URL não definido — obrigatorio para validação JWT do Supabase")
  }
  jwksURL := strings.TrimRight(cfg.SupabaseURL, "/") + "/auth/v1/keys"
  jwks, err := keyfunc.Get(jwksURL, keyfunc.Options{
    RefreshInterval: time.Minute * 10,
  })
  if err != nil {
    log.Fatalf("Falha ao carregar JWKS (%s): %v — não é possível iniciar sem validação JWT", jwksURL, err)
  }
  jwksKeyFunc = jwks.Keyfunc
  log.Printf("JWKS carregado com sucesso: %s", jwksURL)
}

// validateAudience valida se o token tem a audience correta (compatível com JWT v4)
func validateAudience(claims jwt.MapClaims, expectedAud string) bool {
	aud, ok := claims["aud"]
	if !ok {
		return false
	}

	// aud pode ser string ou array de strings
	switch v := aud.(type) {
	case string:
		return v == expectedAud
	case []interface{}:
		for _, audItem := range v {
			if audStr, ok := audItem.(string); ok && audStr == expectedAud {
				return true
			}
		}
	}
	return false
}

// requireAuth é aplicado nas rotas que exigem autenticação.
// Se jwksKeyFunc == nil, fica em modo DEV e permite requisição sem Bearer; nesse caso, o handler deverá
// exigir student_id no payload para identificar o aluno.
func requireAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
    // Validação obrigatória: JWKS deve estar carregado e token presente

		authH := c.GetHeader("Authorization")
		if authH == "" || !strings.HasPrefix(strings.ToLower(authH), "bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Bearer token ausente"})
			return
		}
		tokenStr := strings.TrimSpace(strings.TrimPrefix(authH, "Bearer "))

		// jwt/v4: usar Parser com ValidMethods e MapClaims
		parser := jwt.Parser{
			ValidMethods: []string{"RS256"},
		}
		claims := jwt.MapClaims{}
		tok, err := parser.ParseWithClaims(tokenStr, claims, jwksKeyFunc)
		if err != nil || !tok.Valid {
			log.Printf("Token inválido: %v", err)
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
			return
		}

		// Validar audience manualmente (v4 não tem WithAudience)
		if !validateAudience(claims, "authenticated") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Audience inválida"})
			return
		}

		// Supabase usa o claim "sub" como id do usuário
		userID, _ := claims["sub"].(string)
		if userID == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token sem subject"})
			return
		}

		c.Set("user_id", userID)
		c.Next()
	}
}

// ================================
// Handlers
// ================================

func healthHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

// /version — informa metadados do build
func versionHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"version":  version,
		"commit":   commit,
		"built_at": builtAt,
	})
}

// --- DEV ONLY ---
// Simples gerador de token HS256 para testes locais quando JWKS está desligado.
// Em produção real com Supabase, use sempre o SDK do Supabase no frontend para obter o token RS256.

func getActivities(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()
	rows, err := db.Query(ctx, `
		SELECT id::text, pillar, level, title, description, question,
		       COALESCE(ajuda, '{}')::text,
		       COALESCE(analise_resposta, '{}')::text,
		       created_at
		FROM public.activities
		ORDER BY created_at DESC, id
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	list := make([]Activity, 0)
	for rows.Next() {
		var a Activity
		if err := rows.Scan(&a.ID, &a.Pillar, &a.Level, &a.Title, &a.Description, &a.Question, &a.AjudaJSON, &a.AnaliseRespJSON, &a.CreatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		list = append(list, a)
	}
	c.JSON(http.StatusOK, list)
}

func getPillars(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()
	rows, err := db.Query(ctx, `SELECT DISTINCT pillar FROM public.activities ORDER BY pillar`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()
	var out []string
	for rows.Next() {
		var s string
		if err := rows.Scan(&s); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		out = append(out, s)
	}
	c.JSON(http.StatusOK, out)
}

func getLevels(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()
	rows, err := db.Query(ctx, `SELECT DISTINCT level FROM public.activities ORDER BY level`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()
	var out []int
	for rows.Next() {
		var n int
		if err := rows.Scan(&n); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		out = append(out, n)
	}
	c.JSON(http.StatusOK, out)
}

// POST /api/v1/progress
// Versão corrigida com melhor tratamento de erros e logging
func postProgress(c *gin.Context) {
	var p ProgressPayload
	if err := c.ShouldBindJSON(&p); err != nil {
		log.Printf("Erro ao fazer bind do JSON: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "JSON inválido"})
		return
	}

	// Descobre o student_id: se JWKS ativo, usamos o sub do token; se não, exigimos no payload.
	studentID := ""
	if jwksKeyFunc != nil {
		v, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
			return
		}
		studentID, _ = v.(string)
		if studentID == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token sem sub"})
			return
		}
		log.Printf("Usando student_id do token: %s", studentID)
	} else {
		studentID = strings.TrimSpace(p.StudentID)
		if studentID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "student_id é obrigatório no modo DEV"})
			return
		}
		log.Printf("Usando student_id do payload: %s", studentID)
	}

	if p.ActivityID == "" || p.Status == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "activity_id e status são obrigatórios"})
		return
	}

	// Validar se o status é válido
	if p.Status != "pending" && p.Status != "done" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "status deve ser 'pending' ou 'done'"})
		return
	}

	log.Printf("Insert/Upsert progress: student_id=%s, activity_id=%s, status=%s",
		studentID, p.ActivityID, p.Status)

	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()

	// UPSERT sem especificar id; deixa o banco gerar automaticamente
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

// DELETE /api/v1/progress/student/:studentId
// Em produção (JWKS ativo), só permite deletar o próprio progresso (studentId precisa ser = sub do token)
func deleteProgressByStudent(c *gin.Context) {
	paramID := c.Param("studentId")
	if paramID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "studentId ausente"})
		return
	}
	if jwksKeyFunc != nil {
		v, _ := c.Get("user_id")
		sub, _ := v.(string)
		if sub == "" || sub != paramID {
			c.JSON(http.StatusForbidden, gin.H{"error": "não é permitido deletar progresso de outro aluno"})
			return
		}
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

// ================================
// Boot
// ================================

func main() {
	cfg = loadConfig()
	ctx := context.Background()
	db = connectDB(ctx, cfg.DatabaseURL)
	enableJWKS()

	r := gin.New()
	r.Use(gin.Logger())
	r.Use(gin.Recovery())

	// Middleware global: adiciona X-App-Version em todas as respostas
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("X-App-Version", version)
		c.Next()
	})

	// CORS: inclua aqui os domínios do Vercel/GitHub Pages além do localhost
	corsCfg := cors.Config{
		AllowOrigins:     cfg.AllowOrigins,
		AllowMethods:     []string{"GET", "POST", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Authorization", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length", "X-App-Version"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}
	r.Use(cors.New(corsCfg))

	// Health & Version
	r.GET("/health", healthHandler)
	r.GET("/version", versionHandler)

	// Removido: fluxo de login DEV. Toda autenticação deve vir do Supabase.

	api := r.Group("/api/v1")
	{
		api.GET("/activities", getActivities)
		api.GET("/pillars", getPillars)
		api.GET("/levels", getLevels)

    // Rotas que escrevem exigem JWT válido do Supabase em todos os cenários
    api.POST("/progress", requireAuth(), postProgress)
    api.DELETE("/progress/student/:studentId", requireAuth(), deleteProgressByStudent)
	}

	addr := mustGetEnv("ADDR", ":8080")
	log.Printf("Servidor ouvindo em %s | versão=%s | JWKS=%s", addr, version, func() string {
		if jwksKeyFunc != nil {
			return "ON"
		}
		return "OFF"
	}())
	if err := r.Run(addr); err != nil && !errors.Is(err, http.ErrServerClosed) {
		log.Fatalf("Erro ao subir servidor: %v", err)
	}
}
