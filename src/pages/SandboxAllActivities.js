// src/pages/SandboxAllActivities.js
import React, { useMemo, useState } from 'react';
import ActivityPage from './ActivityPage';

function toNum(x) {
  if (x == null) return null;
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}

// Normaliza formatos: item pode ser objeto {id,name} OU string "abstracao"
const pillarIdOf   = (p) => String((p && p.id != null ? p.id : p));
const pillarLabel  = (p) => {
  if (p && typeof p === 'object') return p.name ?? String(p.id ?? '');
  return String(p ?? '');
};

export default function SandboxAllActivities({
  user,
  pillars = [],
  levels = {},          // pode vir { [pillarId]: Level[] } ou array global; aqui é apenas fallback
  allActivities = [],
  isTeacherSandbox = true,
  onBack,
}) {
  const [pillarId, setPillarId] = useState(null);
  const [levelNumber, setLevelNumber] = useState(null);
  const [activityId, setActivityId] = useState(null);

  // Agrupa atividades por pilar
  const activitiesByPillar = useMemo(() => {
    const byPillar = {};
    for (const a of allActivities || []) {
      const pid = String(a.pillar_id ?? a.pillar ?? '');
      if (!pid) continue;
      if (!byPillar[pid]) byPillar[pid] = [];
      byPillar[pid].push(a);
    }
    return byPillar;
  }, [allActivities]);

  // Níveis derivados das atividades do pilar (robusto a shapes diferentes)
  const levelOptions = useMemo(() => {
    if (!pillarId) return [];
    const acts = activitiesByPillar[String(pillarId)] || [];

    // 1) Deriva a partir das atividades
    const levelNums = Array.from(
      new Set(
        acts.map((a) =>
          toNum(a.level_id ?? a.level ?? a.level_number)
        )
      )
    )
      .filter((n) => n != null && n > 0)
      .sort((a, b) => a - b)
      .map((n) => ({ id: `${pillarId}-${n}`, level_number: n, title: `Nível ${n}` }));

    // 2) Fallback (se quiser mostrar títulos reais dos níveis vindos do endpoint de levels)
    const fromLevelsProp =
      Array.isArray(levels[pillarId])
        ? [...levels[pillarId]]
            .map((lv) => ({
              id: lv.id ?? `${pillarId}-${toNum(lv.level_number) ?? toNum(lv.level) ?? ''}`,
              level_number: toNum(lv.level_number ?? lv.level ?? lv.number),
              title: lv.title || lv.name || `Nível ${toNum(lv.level_number ?? lv.level ?? lv.number)}`,
            }))
            .filter((x) => x.level_number != null)
            .sort((a, b) => a.level_number - b.level_number)
        : [];

    // Preferimos o que vier das atividades (garante existir). Se quiser mesclar títulos, dá pra casar por level_number.
    return levelNums.length ? levelNums : fromLevelsProp;
  }, [pillarId, activitiesByPillar, levels]);

  // Lista de atividades para o pilar/nível atual
  const activitiesForSelection = useMemo(() => {
    if (!pillarId) return [];
    let list = activitiesByPillar[String(pillarId)] || [];
    if (levelNumber != null) {
      const ln = toNum(levelNumber);
      list = list.filter(
        (a) => toNum(a.level_id ?? a.level ?? a.level_number) === ln
      );
    }
    return [...list].sort((a, b) => {
      const la = toNum(a.level_id ?? a.level ?? a.level_number) ?? 0;
      const lb = toNum(b.level_id ?? b.level ?? b.level_number) ?? 0;
      if (la !== lb) return la - lb;
      return String(a.title || a.name || '').localeCompare(String(b.title || b.name || ''));
    });
  }, [pillarId, levelNumber, activitiesByPillar]);

  const currentPillar = useMemo(
    () => (pillars || []).find((p) => pillarIdOf(p) === String(pillarId)),
    [pillars, pillarId]
  );

  // Navegação
  const resetToPillars = () => { setPillarId(null); setLevelNumber(null); setActivityId(null); };
  const backToLevels   = () => { setLevelNumber(null); setActivityId(null); };
  const backToActivities = () => { setActivityId(null); };

  // (Opcional) logs de diagnóstico — remova se preferir
  // console.log('[SANDBOX] pillarId=', pillarId, 'levels(options)=', levelOptions);
  // console.log('[SANDBOX] acts for selection=', activitiesForSelection);

  return (
    <div className="container">
      <h1 className="page-title">Modo Professor — Experimente como Aluno</h1>
      <p className="page-subtitle">Todas as atividades estão desbloqueadas. Você pode ver o gabarito pedagógico.</p>


      {typeof onBack === 'function' && (
        <button className="secondary-button" onClick={onBack} style={{ marginBottom: 12 }}>
          ⟵ Início do Professor
        </button>
      )}

      {/* 1) Escolha do Pilar */}
      {!pillarId && (
        <>
          <h2 className="section-title">Escolha um Pilar</h2>
          <div className="tiles">
            {(pillars || []).map((p) => (
              <button
                key={pillarIdOf(p)}
                type="button"
                className="tile"
                onClick={() => { setPillarId(pillarIdOf(p)); setLevelNumber(null); setActivityId(null); }}
                aria-label={`Pilar ${pillarLabel(p)}`}
              >
                <div className="tile-title">{pillarLabel(p)}</div>
                <div className="tile-subtitle">Todos os níveis desbloqueados</div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* 2) Escolha do Nível */}
      {pillarId && levelNumber == null && (
        <>
          <h2 className="section-title">{pillarLabel(currentPillar)} — Selecione um Nível</h2>
          <button className="secondary-button" onClick={resetToPillars} style={{ marginBottom: 8 }}>⟵ Pilares</button>
          {levelOptions.length === 0 ? (
            <p>Não há níveis detectados para este pilar (verifique se existem atividades vinculadas).</p>
          ) : (
            <div className="tiles">
              {levelOptions.map((lv) => (
                <button
                  key={`${lv.id}`}
                  type="button"
                  className="tile"
                  onClick={() => { setLevelNumber(lv.level_number); setActivityId(null); }}
                  aria-label={`Nível ${lv.level_number}`}
                >
                  <div className="tile-title">Nível {lv.level_number}</div>
                  <div className="tile-subtitle">{lv.title || '—'}</div>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* 3) Escolha de Atividade */}
      {pillarId && levelNumber != null && activityId == null && (
        <>
          <h2 className="section-title">{pillarLabel(currentPillar)} — Nível {levelNumber}: Selecione uma Atividade</h2>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <button className="secondary-button" onClick={resetToPillars}>⟵ Pilares</button>
            <button className="secondary-button" onClick={backToLevels}>⟵ Níveis</button>
          </div>

          {activitiesForSelection.length === 0 ? (
            <p>Não há atividades cadastradas para este nível.</p>
          ) : (
            <div className="tiles">
              {activitiesForSelection.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className="tile"
                  onClick={() => setActivityId(String(a.id))}
                  aria-label={`Atividade ${a.title || a.name}`}
                >
                  <div className="tile-title">{a.title || a.name}</div>
                  <div className="tile-subtitle">
                    Pilar: {pillarLabel(currentPillar)} • Nível: {toNum(a.level_id ?? a.level ?? a.level_number)}
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* 4) Execução da atividade */}
      {activityId && (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <button className="secondary-button" onClick={backToActivities}>⟵ Atividades</button>
            <button className="secondary-button" onClick={backToLevels}>⟵ Níveis</button>
            <button className="secondary-button" onClick={resetToPillars}>⟵ Pilares</button>
          </div>
          <ActivityPage
            user={user}
            activityId={activityId}
            allActivities={allActivities}
            isTeacherSandbox={isTeacherSandbox}
            onBack={backToActivities}
          />
        </>
      )}
    </div>
  );
}
