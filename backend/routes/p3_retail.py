import json
from typing import List, Optional
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from utils.claude_client import stream_claude

router = APIRouter(prefix="/api/p3", tags=["P3 Retail"])

SYSTEM = """You are PromoMind AI, an expert autonomous retail promotion strategy agent.
You create data-driven, specific, actionable promotion plans for Indian retail companies.
Use Indian retail context: ₹ prices, Indian cities (Mumbai/Delhi/Bangalore/Chennai/Kolkata),
Indian shopping seasons (Diwali, Holi, Republic Day, Independence Day, End-of-Season).
Always be specific with numbers, percentages, timelines, and ₹ figures.
Format with clear numbered sections and headers."""


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


class PromoBase(BaseModel):
    products: List[str] = ["T-Shirts", "Sneakers", "Bags"]
    marginFloor: int = 20
    budget: int = 35
    clearanceTarget: int = 30
    season: str = "Diwali Season (Oct–Nov)"
    geography: str = "All India — Regional Customisation"
    segments: List[str] = ["Youth 18-25", "Working 26-40"]
    competitorContext: str = "Standard competitive market"


class SimRequest(PromoBase):
    discountRange: str = "20-35"


class ReasoningRequest(PromoBase):
    pass


@router.post("/generate")
async def generate(req: PromoBase):
    products_str = ", ".join(req.products)
    segments_str = ", ".join(req.segments)

    user = f"""Create a complete retail promotion strategy:

PRODUCTS AVAILABLE: {products_str}
MARGIN FLOOR (hard constraint): {req.marginFloor}%
MARKETING BUDGET: ₹{req.budget} lakhs
INVENTORY CLEARANCE TARGET: {req.clearanceTarget}%
SEASON / UPCOMING EVENT: {req.season}
TARGET GEOGRAPHY: {req.geography}
TARGET CUSTOMER SEGMENTS: {segments_str}
COMPETITOR CONTEXT: {req.competitorContext}

Generate:

1. SELECTED PROMOTIONS — For each product you recommend promoting:
   - Promotion mechanism (flat discount / BOGO / bundle / loyalty early access)
   - Exact discount % — must keep margin ≥ {req.marginFloor}% after discount
   - Duration in days
   - Target audience (which segment and why)
   - Budget allocation ₹ amount
   - Expected volume lift %
   - Specific reason this product + mechanism combination was chosen

2. PROMOTION SEQUENCING — Exact week-by-week calendar showing which promotion
   runs in which week and why that order minimizes cannibalization

3. BUDGET ALLOCATION TABLE — How ₹{req.budget}L is split across:
   - Each product promotion
   - Digital advertising (social/search/app)
   - Offline (OOH/print)
   - Influencer marketing
   - Reserve for competitor response

4. CONSTRAINTS SATISFIED — Explicitly confirm each constraint is met:
   - Margin floor ≥ {req.marginFloor}% ✓ (show the math)
   - Clearance target {req.clearanceTarget}% addressed ✓
   - Within budget ₹{req.budget}L ✓

5. EXPECTED OUTCOMES — Total revenue lift %, inventory clearance achieved, projected ROI"""

    return streaming_response(SYSTEM, user)


@router.post("/cannibalization")
async def cannibalization(req: PromoBase):
    products_str = ", ".join(req.products)

    user = f"""Cannibalization analysis for promotions:

PRODUCTS: {products_str}
SEASON: {req.season}
MARGIN FLOOR: {req.marginFloor}%

Provide:

1. CANNIBALIZATION RISK MATRIX — For each possible product pair combination,
   estimate the substitution rate % if both are promoted simultaneously.
   Example format: T-Shirts + Jackets → 23% substitution risk (customers switch)

2. HIGH-RISK COMBINATIONS — Which product promotions absolutely CANNOT run at the
   same time, with specific substitution % and ₹ revenue loss estimate

3. SAFE COMBINATIONS — Which promotions can safely run in parallel with
   minimal cannibalization (< 5% substitution)

4. OPTIMAL PROMOTION CALENDAR — Week-by-week schedule that minimizes cannibalization:
   Week 1: [Product] — reason
   Week 2: [Product] — reason
   Week 3: [Product] — reason
   Week 4: [Product] — reason

5. CROSS-SELL OPPORTUNITIES (positive product relationships):
   - Products frequently bought together (e.g., sneakers → socks 67%)
   - How to design bundles that capture this vs cannibalizing

6. ₹ REVENUE IMPACT — Estimated revenue loss if cannibalization is ignored vs
   properly sequenced (show the calculation)"""

    return streaming_response(SYSTEM, user)


@router.post("/geo")
async def geo(req: PromoBase):
    products_str = ", ".join(req.products)

    user = f"""Geographic promotion customization plan:

PRODUCTS: {products_str}
SCOPE: {req.geography}
BUDGET: ₹{req.budget} lakhs
SEASON: {req.season}
COMPETITOR CONTEXT: {req.competitorContext}

For each geography below, provide:
- Recommended discount depth % and explanation of why it differs from the national average
- Products to focus on in that market and why
- Key customer segment to target
- Competitive intensity and how it drives the discount decision
- Media channel mix (social media / OOH billboards / local influencers / WhatsApp / regional TV)
- Budget allocation ₹ amount
- Any geography-specific promotion mechanism or festival alignment

GEOGRAPHIES TO COVER:
1. Mumbai (Maharashtra)
2. Delhi NCR
3. Bangalore (Karnataka)
4. Chennai (Tamil Nadu)
5. Kolkata (West Bengal)
6. Hyderabad (Telangana)
7. Tier 2 Cities (Pune, Surat, Jaipur, Lucknow, Ahmedabad)
8. Tier 3 Cities (smaller markets)

ALSO INCLUDE:
- How to implement geo-targeting technically (app geo-fencing / store-level pricing / regional landing pages)
- How to measure performance by geography and when to adjust mid-campaign"""

    return streaming_response(SYSTEM, user)


@router.post("/simulate")
async def simulate(req: SimRequest):
    products_str = ", ".join(req.products)

    user = f"""Pre-launch simulation for this promotion plan:

PRODUCTS: {products_str}
DISCOUNT RANGE: {req.discountRange}%
MARKETING BUDGET: ₹{req.budget} lakhs
MARGIN FLOOR: {req.marginFloor}%
SEASON: {req.season}

Simulate the 4-week promotion:

1. WEEK-BY-WEEK REVENUE FORECAST (table format):
   | Week | Baseline ₹ | With Promo ₹ | Units Sold | Margin % | Cumulative ROI |
   (Fill in all 4 weeks)

2. THREE-SCENARIO ANALYSIS:
   BEST CASE (competitor doesn't react, footfall +20%, demand responds strongly):
   - Total revenue ₹, total units sold, final ROI, margin achieved

   EXPECTED CASE (base assumptions hold):
   - Total revenue ₹, total units sold, final ROI, margin achieved

   WORST CASE (competitor matches discount, poor footfall, demand -15%):
   - Total revenue ₹, total units sold, final ROI — does it still beat baseline?

3. BREAK-EVEN ANALYSIS
   - How many units need to sell to break even on the ₹{req.budget}L marketing spend?
   - What % of target audience needs to convert?

4. TOP 5 RISK FACTORS with probability % and severity (High/Medium/Low)

5. WEEK 1 EARLY WARNING INDICATORS
   - If these metrics are not hit by end of Week 1, the campaign needs adjustment:
   - [Specific KPIs with threshold values]

6. CONTINGENCY PLANS — If Week 1 performance is >20% below target:
   - Lever 1: [specific action]
   - Lever 2: [specific action]
   - Lever 3: [specific action]

7. ROI PROJECTION SUMMARY
   - Return on ₹{req.budget}L investment under each scenario"""

    return streaming_response(SYSTEM, user)


@router.post("/reasoning")
async def reasoning(req: ReasoningRequest):
    products_str = ", ".join(req.products)
    segments_str = ", ".join(req.segments)

    user = f"""Walk through your complete reasoning chain for this promotion plan:

INPUTS:
- Products: {products_str}
- Margin floor: {req.marginFloor}%
- Budget: ₹{req.budget}L
- Clearance target: {req.clearanceTarget}%
- Season: {req.season}
- Geography: {req.geography}
- Segments: {segments_str}
- Competitors: {req.competitorContext}

Explain each decision step AS THE AI AGENT reasoning through the problem:

STEP 1 — PRODUCT SELECTION LOGIC
Which signals (inventory level / margin headroom / competitor pricing / demand velocity)
drove each product being selected or rejected? Show the scoring for each product.

STEP 2 — MECHANISM SELECTION LOGIC
For each selected product, why was THIS promotion type chosen over alternatives?
What would go wrong with a different mechanism?

STEP 3 — DISCOUNT OPTIMIZATION MATH
Show the calculation: original margin → discount applied → resulting margin → confirm ≥ {req.marginFloor}%
Do this for each product's recommended discount.

STEP 4 — CANNIBALIZATION CHECK
Which product pairs were evaluated? What substitution rates were estimated?
How did this drive the sequencing decision?

STEP 5 — GEOGRAPHIC DIFFERENTIATION LOGIC
What data signals drove each city's different discount depth?
Why does Mumbai get a different discount than Tier 2 cities?

STEP 6 — SEQUENCING DECISION
Why is the promotion calendar in this specific order?
What goes wrong if the order is reversed?

STEP 7 — BUDGET ALLOCATION LOGIC
How was ₹{req.budget}L split and why? What optimization was performed?
Why this split vs an equal split?

STEP 8 — CONSTRAINT SATISFACTION VERIFICATION
Confirm all constraints are satisfied with numbers:
- Margin ≥ {req.marginFloor}%: [show proof]
- Clearance target {req.clearanceTarget}%: [show how it's addressed]
- Budget ≤ ₹{req.budget}L: [show allocation totals]"""

    return streaming_response(SYSTEM, user)
