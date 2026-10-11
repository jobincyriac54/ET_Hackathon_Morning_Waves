import json
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from utils.claude_client import stream_claude

router = APIRouter(prefix="/api/p1", tags=["P1 Banking"])

SYSTEM = """You are RegGuard AI, an expert autonomous regulatory compliance agent for Indian banks.
You have deep knowledge of RBI regulations, Basel III, DPDPA 2023, AML/PMLA, FEMA, and SEBI rules.
Provide structured, specific, actionable compliance intelligence. Use Indian banking context.
Always format responses with clear numbered sections and headers. Be precise with regulatory references."""


async def sse_stream(system: str, user: str, max_tokens: int = 1500):
    async for chunk in stream_claude(system, user, max_tokens):
        yield f"data: {json.dumps({'chunk': chunk})}\n\n"
    yield f"data: {json.dumps({'done': True})}\n\n"


def streaming_response(system: str, user: str, max_tokens: int = 1500) -> StreamingResponse:
    return StreamingResponse(
        sse_stream(system, user, max_tokens),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


class AnalyseRequest(BaseModel):
    regulationType: str = "Basel III — Capital Adequacy Framework"
    bankType: str = "Domestic Scheduled Commercial Bank (D-SIB)"
    regulatoryText: str = ""
    controlsText: str = ""


class ObligationsRequest(BaseModel):
    text: str = ""


class GapsRequest(BaseModel):
    regulation: str = "Basel III LCR"
    lastEvidenceDate: str = "April 2026"
    currentStatus: str = ""


class RemediationRequest(BaseModel):
    gapDescription: str = ""
    urgency: str = "Critical — Immediate regulatory risk"
    bankSize: str = "D-SIB (large, systemically important)"


class SimulateRequest(BaseModel):
    proposedRegulation: str = ""
    currentControls: str = ""


class CrossRegRequest(BaseModel):
    regA: str = ""
    regB: str = ""
    context: str = ""


@router.post("/analyse")
async def analyse(req: AnalyseRequest):
    user = f"""Regulation: {req.regulationType}
Bank Type: {req.bankType}

Regulatory Text:
{req.regulatoryText or 'Describe Basel III LCR requirements for D-SIBs in India'}

Current Internal Controls:
{req.controlsText or 'Not provided'}

Provide:
1. KEY OBLIGATIONS — Extract 5-6 specific numbered compliance obligations (OBL-001 etc.)
2. APPLICABILITY — Which aspects apply to this bank type and why
3. CONTROL ASSESSMENT — Evaluate adequacy of described controls against each obligation
4. PRELIMINARY GAPS — Identify obvious gaps with GAP-ID references
5. RISK LEVEL — Overall compliance risk (Critical/High/Medium/Low) with detailed reasoning
6. RECOMMENDED NEXT STEPS — Immediate actions the compliance team should take"""

    return streaming_response(SYSTEM, user)


@router.post("/obligations")
async def obligations(req: ObligationsRequest):
    user = f"""Extract compliance obligations from:
{req.text or 'Basel III LCR and NSFR requirements for D-SIBs in India'}

Structure your response as:
1. OBLIGATION LIST — Each obligation with:
   - ID (OBL-001, OBL-002...)
   - Exact requirement statement
   - Who it applies to (which bank types)
   - Evidence needed to prove compliance
   - Reporting timeline / frequency

2. CONTROL MAPPING TEMPLATE — For each obligation, the internal policy type that should cover it
   (e.g., OBL-002 → CP-LIQ-03: Liquidity Coverage Policy owned by Treasury)

3. EVIDENCE REQUIREMENTS — Exact documents that must be maintained and retention period

4. MONITORING TRIGGERS — Events that should trigger re-assessment of each obligation"""

    return streaming_response(SYSTEM, user)


@router.post("/gaps")
async def gaps(req: GapsRequest):
    user = f"""Regulation: {req.regulation}
Last Evidence Date: {req.lastEvidenceDate}
Current Status: {req.currentStatus}

Gap Analysis:
1. GAP INVENTORY — For each gap identified:
   - GAP-ID (GAP-001, GAP-002...)
   - Description of what is missing
   - Which obligation (OBL-ID) it violates
   - Root cause (process failure / coverage gap / outdated evidence)

2. RISK SCORING — For each gap:
   - Regulatory severity score (1-10)
   - Time exposure score based on evidence age (1-10)
   - Coverage breadth (what % of required entities are covered)
   - Overall risk score (weighted) and Tier (Critical/High/Medium/Low)

3. PRIORITY RANKING — Ranked remediation priority with justification for each position

4. REGULATORY EXPOSURE — What specific RBI/SEBI supervisory actions could result from each gap if not addressed

5. QUICK WINS — Which gaps can be closed in less than 48 hours vs those requiring long-term remediation"""

    return streaming_response(SYSTEM, user)


@router.post("/remediation")
async def remediation(req: RemediationRequest):
    user = f"""Gap Description: {req.gapDescription}
Urgency: {req.urgency}
Bank Size/Type: {req.bankSize}

Generate a complete, specific remediation plan:

1. IMMEDIATE ACTIONS (Day 1-3)
   - Exact tasks, who performs them (role title), which systems/tools needed

2. SHORT-TERM ACTIONS (Week 1-2)
   - Policy changes, process updates, team training required

3. MEDIUM-TERM ACTIONS (Month 1-3)
   - Systemic fixes, automation, control framework updates

4. OWNERSHIP MATRIX — Assign each action to a specific role:
   CFO / Treasury Head / Internal Audit / Legal / Risk Management / Branch Operations / CTO

5. VERIFICATION CHECKPOINTS — How completion of each step is verified and documented

6. BOARD REPORTING — What goes to Board Risk Committee, when, and in what format

7. REGULATORY COMMUNICATION — Whether to proactively engage RBI/SEBI; draft communication if yes

8. AUTOMATION OPPORTUNITY — What should be automated to prevent this gap from recurring"""

    return streaming_response(SYSTEM, user)


@router.post("/simulate")
async def simulate(req: SimulateRequest):
    user = f"""Proposed / Upcoming Regulation:
{req.proposedRegulation}

Current Control Framework:
{req.currentControls}

Impact Simulation:
1. IMPACT SUMMARY — Executive summary with overall severity rating

2. OBLIGATION CHANGES
   - New obligations introduced (with IDs)
   - Existing obligations that are modified or tightened

3. CONTROL GAPS (Pre-emptive, labeled SIM-GAP-001...)
   - Controls that will be inadequate when the regulation becomes effective
   - Controls that don't exist yet but will be required

4. FINANCIAL IMPACT (quantified where possible)
   - Capital ratio change (%)
   - Cost of compliance (₹ estimate)
   - Provisioning requirements
   - Timeline to achieve compliance

5. REMEDIATION ROADMAP
   - Pre-effective date milestones and deadlines

6. RISK TIMELINE
   - If unaddressed, what regulatory actions occur and when

7. COMPETITIVE LANDSCAPE
   - How this regulation affects competitive positioning vs peer banks"""

    return streaming_response(SYSTEM, user)


@router.post("/crossreg")
async def crossreg(req: CrossRegRequest):
    user = f"""Regulation A:
{req.regA}

Regulation B:
{req.regB}

Data / Context in Question:
{req.context}

Conflict Analysis:
1. CONFLICT IDENTIFICATION
   - Precisely where and how the two regulations conflict
   - Quote the specific clauses from each regulation that create the conflict

2. LEGAL RISK ASSESSMENT
   - Penalty exposure under Regulation A if complying only with B
   - Penalty exposure under Regulation B if complying only with A
   - Which regulator (RBI / DPDP Authority / SEBI) enforces each

3. RESOLUTION OPTIONS — Three distinct approaches:
   a. Technical/architectural separation (data anonymisation, pseudonymisation, separate storage)
   b. Regulatory engagement (seeking formal guidance or exemption)
   c. Policy design (a reconciliation policy that satisfies both)

4. RECOMMENDED APPROACH — Most practical, lowest legal risk option with implementation steps

5. INTERIM MEASURES — What to do right now while awaiting regulatory clarity

6. PRECEDENT — Known RBI/SEBI/DPDP Authority guidance on similar conflicts

7. BOARD COMMUNICATION — How to present this conflict to the Board Risk Committee"""

    return streaming_response(SYSTEM, user)
