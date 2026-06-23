PROJECT_PHASES = [
    "orcamento",
    "aprovado",
    "pre_producao",
    "gravando",
    "em_edicao",
    "revisao",
    "concluido",
]

PROJECT_SPECIAL_STATUSES = [
    "cancelado",
    "arquivado",
]

ALL_PROJECT_STATUSES = PROJECT_PHASES + PROJECT_SPECIAL_STATUSES

PHASE_LABELS = {
    "orcamento": "Orçamento",
    "aprovado": "Aprovado",
    "pre_producao": "Pré-produção",
    "gravando": "Gravando",
    "em_edicao": "Em edição",
    "revisao": "Revisão",
    "concluido": "Concluído",
    "cancelado": "Cancelado",
    "arquivado": "Arquivado",
}


def get_next_phase(current_phase: str) -> str | None:
    """Retorna a próxima fase do pipeline, ou None se já estiver na última."""
    if current_phase not in PROJECT_PHASES:
        return None
    index = PROJECT_PHASES.index(current_phase)
    if index + 1 < len(PROJECT_PHASES):
        return PROJECT_PHASES[index + 1]
    return None


def get_previous_phase(current_phase: str) -> str | None:
    """Retorna a fase anterior do pipeline, ou None se já estiver na primeira."""
    if current_phase not in PROJECT_PHASES:
        return None
    index = PROJECT_PHASES.index(current_phase)
    if index - 1 >= 0:
        return PROJECT_PHASES[index - 1]
    return None