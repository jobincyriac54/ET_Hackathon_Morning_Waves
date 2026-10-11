import json
from typing import Optional
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from utils.claude_client import stream_claude

router = APIRouter(prefix="/api/p4", tags=["P4 Energy"])

SYSTEM = """You are GridMind AI, an autonomous renewable energy orchestrator managing:
- 5 solar farms: SF1 Rajasthan (100MW), SF2 Gujarat (120MW), SF3 Andhra (80MW),
  SF4 Tamil Nadu (90MW), SF5 Maharashtra (80MW)
- 3 wind farms: WF-A Kutch (90MW), WF-B Tamil Nadu Coast (75MW), WF-C Rajasthan (60MW)
- 2 battery energy storage systems: BESS Alpha (200MWh), BESS Beta (150MWh)
- Industrial consumers: Steel Plant 120MW, Cement Plant 85MW, Data Center 45MW, Chemical 62MW
- Grid interconnections and electricity market access

You dispatch decisions every 15 minutes. Objective priority (highest to lowest):
1. Grid Reliability   2. Carbon Minimisation   3. Cost Minimisation
4. Revenue Maximisation   5. Battery Longevity   6. Renewable Curtailment Minimisation

Use Indian energy market: ₹/kWh prices, MW/MWh units. Be specific and quantified in all responses."""


async def sse_stream(system: str, user: str, max_tokens: int = 1500):
    async for chunk in stream_claude(system, user, max_tokens):
        yield f"data: {json.dumps({'chunk': chunk})}\n\n"
    yield f"data: {json.dumps({'done': True})}\n\n"


def streaming_response(system: str, user: str) -> StreamingResponse:
    return StreamingResponse(
        sse_stream(system, user),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive", "X-Accel-Buffering": "no"},
    )


class GridState(BaseModel):
    solar: float = 342.0
    wind: float = 187.0
    batAlpha: float = 72.0
    batAlphaStatus: str = "Charging 40MW"
    batBeta: float = 61.0
    batBetaStatus: str = "Standby"
    demand: float = 498.0
    price: float = 4.2
    transmission: float = 62.0
    surplus: float = 31.0
    storm: str = "None"


class ScenarioRequest(BaseModel):
    scenario: str
    gridState: Optional[GridState] = None


class QueryRequest(BaseModel):
    question: str
    gridState: Optional[GridState] = None


class OptimizeRequest(BaseModel):
    gridState: Optional[GridState] = None
    objectives: Optional[list] = None


class ForecastRequest(BaseModel):
    gridState: Optional[GridState] = None
    weatherForecast: str = "Sunny morning, partial cloud 14:00-17:00, wind increasing after 18:00, no storms"


def format_grid_state(gs: Optional[GridState]) -> str:
    if not gs:
        return "Grid state: Solar 342MW, Wind 187MW, BESS Alpha SOC 72%, BESS Beta SOC 61%, Demand 498MW, Price ₹4.2/kWh, Surplus +31MW, Storm: None"
    return f"""Current Grid State:
  Solar output:        {gs.solar} MW
  Wind output:         {gs.wind} MW
  BESS Alpha:          SOC {gs.batAlpha}% — {gs.batAlphaStatus}
  BESS Beta:           SOC {gs.batBeta}% — {gs.batBetaStatus}
  Grid demand:         {gs.demand} MW
  Market price:        ₹{gs.price}/kWh
  Transmission load:   {gs.transmission}%
  Surplus / Deficit:   {'+' if gs.surplus >= 0 else ''}{gs.surplus} MW
  Storm alert:         {gs.storm}
  Total renewable:     {gs.solar + gs.wind} MW
  Renewable cover:     {round((gs.solar + gs.wind) / gs.demand * 100, 1)}%"""


@router.post("/scenario")
async def scenario(req: ScenarioRequest):
    state_str = format_grid_state(req.gridState)

    user = f"""SCENARIO EVENT: {req.scenario}

{state_str}

As GridMind AI, respond to this scenario with full autonomous agent reasoning:

1. SITUATION ASSESSMENT
   - What exactly changed and why it matters
   - Immediate risk or opportunity created
   - Time window available to act before conditions worsen

2. DISPATCHED ACTIONS — List 4-6 specific actions being executed RIGHT NOW:
   For each action state the exact quantity, the asset/market, the ₹ impact, and the reason:
   - Battery: charge/discharge X MW from BESS [Alpha/Beta] (reason + revenue/cost impact)
   - Market: buy/sell X MW at ₹X/kWh (reason + timing)
   - Generation: curtail X farm by X MW (reason — why curtail rather than store or sell?)
   - Demand: trigger demand response for [consumer], reduce X MW (incentive ₹/MWh)

3. MULTI-OBJECTIVE TRADE-OFF
   - Which competing objectives are in conflict in this specific scenario?
   - How was the conflict resolved? (e.g., reliability prioritised over revenue)
   - What is the cost of that priority decision in ₹?

4. 24-HOUR SIMULATION — What happens across 4 time windows:
   Next 15 minutes: [actions and expected outcomes]
   Next 1 hour:     [actions and expected outcomes]
   Next 4 hours:    [actions and expected outcomes]
   Next 24 hours:   [actions and expected outcomes, including recovery plan]

5. RISK ASSESSMENT
   - What could still go wrong even with these actions?
   - What contingency actions are pre-armed and at what trigger threshold?

6. METRICS IMPACT — Quantify the effect of these actions on:
   - Operating cost (₹/hr change)
   - Revenue today (₹ change)
   - CO₂ saved (tonnes change)
   - Battery degradation (cycle impact)
   - Grid reliability (frequency stability %)"""

    return streaming_response(SYSTEM, user)


@router.post("/query")
async def query(req: QueryRequest):
    state_str = format_grid_state(req.gridState)

    user = f"""{state_str}

Question from grid operator: {req.question}

Provide a specific, quantified answer:
- Use MW, MWh, ₹/kWh, % units throughout
- Show your reasoning (why this recommendation vs alternatives)
- Include any trade-offs the operator should be aware of
- State any assumptions you are making about future conditions
- If the question involves a decision, state the exact recommended action"""

    return streaming_response(SYSTEM, user)


@router.post("/optimize")
async def optimize(req: OptimizeRequest):
    state_str = format_grid_state(req.gridState)
    obj_str = ", ".join(req.objectives) if req.objectives else "Reliability > Carbon > Cost > Revenue > Battery Longevity"

    user = f"""Run full dispatch optimization for this 15-minute window:

{state_str}

Objective priority: {obj_str}

Provide:

1. OPTIMAL ACTION SET — Exact dispatch for the next 15 minutes:
   List every action with asset name, quantity (MW), duration, and financial impact (₹)

2. OBJECTIVE SCORES — How well does the optimal action set perform on each objective?
   Rate each 0-100:
   - Grid Reliability: X/100 (reasoning)
   - Carbon Minimisation: X/100 (reasoning)
   - Cost Minimisation: X/100 (reasoning)
   - Revenue Maximisation: X/100 (reasoning)
   - Battery Longevity: X/100 (reasoning)

3. TWO ALTERNATIVE STRATEGIES with different trade-offs:
   Strategy A: [Name — e.g., "Maximum Revenue Focus"]
   - Actions: [list]
   - Trade-off: [what is sacrificed vs optimal]
   - Objective scores: [how it compares]

   Strategy B: [Name — e.g., "Maximum Carbon Reduction"]
   - Actions: [list]
   - Trade-off: [what is sacrificed vs optimal]
   - Objective scores: [how it compares]

4. UNCERTAINTY ADJUSTMENT
   - What are the top 3 uncertain inputs (weather / price / demand)?
   - How does the optimal strategy perform in the worst-case uncertainty scenario?
   - Is the strategy robust or does it need a contingency?

5. NEXT DECISION POINT
   - What specific event or threshold triggers the next re-optimization before the
     scheduled 15-minute window?"""

    return streaming_response(SYSTEM, user)


@router.post("/forecast")
async def forecast(req: ForecastRequest):
    state_str = format_grid_state(req.gridState)

    user = f"""Run 24-hour energy portfolio simulation:

{state_str}
Weather forecast: {req.weatherForecast}

Simulate hour by hour for the next 24 hours:

1. HOURLY GENERATION TABLE (key hours, not all 24 — group similar hours):
   | Hour | Solar MW | Wind MW | Total Gen | Demand MW | Price ₹/kWh | Balance |
   Include at minimum: 06:00, 09:00, 12:00, 15:00, 18:00, 21:00, 00:00, 03:00

2. BATTERY DISPATCH SCHEDULE — Optimized charge/discharge plan:
   - When to charge BESS Alpha (hours, MW rate, reason)
   - When to discharge BESS Alpha (hours, MW rate, reason)
   - BESS Beta role (standby/emergency reserve/active cycling)
   - Target SOC at end of day and why

3. MARKET ACTIONS — When to buy and when to sell:
   - Sell windows: [times, quantities, expected prices, ₹ revenue]
   - Buy windows (if any): [times, quantities, prices, reason]
   - Total revenue from market actions ₹

4. RENEWABLE UTILIZATION — For each major time block:
   - % of available renewables used
   - MW curtailed (if any) and why
   - Strategy to minimize curtailment

5. DAILY SUMMARY:
   - Total revenue ₹
   - Total operating cost ₹
   - Net margin ₹
   - CO₂ saved (tonnes vs fossil baseline)
   - Battery SOC at day end
   - Renewable utilization %
   - Grid reliability maintained: Yes/No"""

    return streaming_response(SYSTEM, user)
