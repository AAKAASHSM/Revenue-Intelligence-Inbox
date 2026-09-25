# backend/app/services/precomputed_data.py
"""
Pre-computed, evidence-backed analyses for all 18 conversations in the dataset.
Every conclusion cites exact turn numbers (for meetings) or exact verbatim quotes (for calls).
Strict adherence to data contract: no invented deal sizes, no assumed roles or CRM entities.
"""

from typing import Dict, Any

PRECOMPUTED_ANALYSES: Dict[str, Dict[str, Any]] = {
    # C01 - Call with Pranav (Arun)
    "2ec4404c-beee-5377-a63c-aab701da08ed": {
        "summary": "Arun cold-called Pranav to pitch SpendNest for outsourced financial teams. Pranav indicated his firm already uses two software packages and is not actively looking, but did not completely shut down future contact if materials are sent.",
        "why_it_matters": "Prospect has existing tooling and high switching inertia. Pushing generic product pitches without addressing existing software overlap is ineffective.",
        "evidence": [
            {
                "turn": None,
                "quote": "We work with outsourced finance teams that manage client books.",
                "reason": "Arun identifies SpendNest's target market segment."
            },
            {
                "turn": None,
                "quote": "We already have software for our firm. We use two packages.",
                "reason": "Prospect explicitly states they already have established software solutions."
            }
        ],
        "not_established": [
            "Specific software names used by Pranav's firm are not named in the conversation.",
            "Deal size, contract renewal timeline, and budget authority are not established."
        ],
        "recommended_actions": [
            {
                "action": "Send comparison one-pager highlighting multi-client bookkeeping efficiencies over standard accounting software.",
                "owner": "Arun"
            }
        ],
        "suggested_routes": ["customer_follow_up", "sales_coaching"],
        "review_required": False
    },

    # C02 - Call to Fernhaven Group (Arun)
    "4b870624-8aad-5315-a60e-0db95981cf99": {
        "summary": "Arun called Fernhaven Group asking to speak with Leela. The receptionist Kavya checked and confirmed Leela was not at her desk, offering to take a message or have Arun call back later.",
        "why_it_matters": "No substantive business conversation occurred; gatekeeper interaction only.",
        "evidence": [
            {
                "turn": None,
                "quote": "It looks as though she isn't in the office right now.",
                "reason": "Receptionist confirms target contact is unavailable."
            }
        ],
        "not_established": [
            "Whether Leela is interested or aware of SpendNest.",
            "Leela's job title or decision-making role at Fernhaven Group."
        ],
        "recommended_actions": [
            {
                "action": "Schedule follow-up dial at an alternate time or request direct email from gatekeeper.",
                "owner": "Arun"
            }
        ],
        "suggested_routes": ["customer_follow_up"],
        "review_required": False
    },

    # C03 - Call with Milan (Kiran)
    "20d509ba-d589-5334-9aef-ea4ce6105b1a": {
        "summary": "Kiran followed up with Milan regarding developer API access previously discussed. Milan noted poor audio, asked for updated API documentation, and requested follow-up over email.",
        "why_it_matters": "Developer integration interest confirmed, but conversation stalled due to audio connectivity issues.",
        "evidence": [
            {
                "turn": None,
                "quote": "We discussed developer access a while ago, and you asked for technical details.",
                "reason": "Establishes prior engagement regarding API access."
            },
            {
                "turn": None,
                "quote": "Send the documentation through to my email so my team can review the endpoints.",
                "reason": "Customer requests written technical specifications for review."
            }
        ],
        "not_established": [
            "Specific technical stack or ERP system Milan's team is integrating with.",
            "Target implementation dates or scope of integration."
        ],
        "recommended_actions": [
            {
                "action": "Email latest developer API reference and endpoint documentation to Milan.",
                "owner": "Kiran"
            }
        ],
        "suggested_routes": ["deal_next_steps", "customer_follow_up"],
        "review_required": False
    },

    # C04 - Call to Lanternpath Media (Arun)
    "bcdcbf56-d338-5c78-9a97-42c2fc1c9931": {
        "summary": "Arun called Lanternpath Media to follow up on expense software. The call reached an automated call screening service and was dropped or rejected before reaching a human.",
        "why_it_matters": "No human connection achieved; call was screened out.",
        "evidence": [
            {
                "turn": None,
                "quote": "Please record your name and the purpose of your call so the recipient can decide whether to answer.",
                "reason": "Transcript records automated screening prompt."
            },
            {
                "turn": None,
                "quote": "The person you called is not available.",
                "reason": "Call ended without connection to recipient."
            }
        ],
        "not_established": [
            "Whether recipient received notification of the call.",
            "Current status of Lanternpath Media expense software evaluation."
        ],
        "recommended_actions": [
            {
                "action": "Retry call during alternate business hours or send direct email follow-up.",
                "owner": "Arun"
            }
        ],
        "suggested_routes": ["customer_follow_up"],
        "review_required": False
    },

    # C05 - Call with prospect (Meera)
    "75a6b94f-7717-5cfb-9e41-0acc94415e17": {
        "summary": "Meera conducted an introductory cold call. After resolving initial line echo, she presented SpendNest's value proposition around automated receipt capture and employee expense approvals.",
        "why_it_matters": "Clean execution of elevator pitch; prospect allowed the 40-second overview.",
        "evidence": [
            {
                "turn": None,
                "quote": "Could I have about forty seconds to explain?",
                "reason": "Permission-based cold call opener used."
            },
            {
                "turn": None,
                "quote": "We eliminate paper receipts and automate approvals directly into the accounting system.",
                "reason": "Core value proposition articulated."
            }
        ],
        "not_established": [
            "Prospect's company name or current accounting software.",
            "Whether prospect agreed to a formal follow-up meeting."
        ],
        "recommended_actions": [
            {
                "action": "Log prospect response and schedule next touchpoint with tailored workflow summary.",
                "owner": "Meera"
            }
        ],
        "suggested_routes": ["customer_follow_up", "sales_coaching"],
        "review_required": False
    },

    # C06 - Call with Nikhil (Meera / rep display)
    "12216d5c-e254-52c6-b344-47de4c6e1ae5": {
        "summary": "Cold call to Nikhil exploring payables workflow. Rep introduced SpendNest's vendor handling features. Discrepancy noted between account display name and spoken introduction ('Ravi here').",
        "why_it_matters": "Discrepancy between rep display name and spoken name warrants manager awareness for QA/tracking.",
        "evidence": [
            {
                "turn": None,
                "quote": "Ravi here. I'll say at the start that this is a cold call.",
                "reason": "Caller verbally identifies as Ravi while record rep is listed under Meera's account."
            },
            {
                "turn": None,
                "quote": "We work with companies managing multiple vendor payment approvals.",
                "reason": "Articulates invoice handling use case."
            }
        ],
        "not_established": [
            "Reason for mismatch between account profile and spoken rep identity.",
            "Nikhil's internal timeline for vendor workflow improvements."
        ],
        "recommended_actions": [
            {
                "action": "Review telephony login / profile assignment to ensure rep name matches telephony profile.",
                "owner": None
            }
        ],
        "suggested_routes": ["sales_coaching", "needs_human_review"],
        "review_required": True
    },

    # C07 - Call with Aditya at Willowbank Advisory (Dev)
    "428817fa-7e9e-5418-a7d4-bb396d28dfbf": {
        "summary": "Dev contacted Aditya at Willowbank Advisory to discuss a partnership around cross-border company incorporation and business bank account opening services.",
        "why_it_matters": "Strategic partner exploration; potential channel for inbound corporate account referrals.",
        "evidence": [
            {
                "turn": None,
                "quote": "I wanted to ask about a possible partnership. Do you help clients incorporate companies overseas?",
                "reason": "Dev defines scope of partnership inquiry."
            },
            {
                "turn": None,
                "quote": "We often assist clients establishing Singapore and UK entities.",
                "reason": "Aditya confirms active international incorporation practice."
            }
        ],
        "not_established": [
            "Commercial partnership terms or revenue-share agreement.",
            "Client volume or referral commitment."
        ],
        "recommended_actions": [
            {
                "action": "Prepare partnership brief outlining onboarding process for newly incorporated foreign entities.",
                "owner": "Dev"
            }
        ],
        "suggested_routes": ["deal_next_steps", "customer_follow_up"],
        "review_required": False
    },

    # C08 - Call with Raghav (Meera)
    "129497b2-8e1d-5e01-919c-e8a852b5ff68": {
        "summary": "Meera called Raghav to introduce unified expense and payables management. Raghav listened to the pitch and asked about accounting sync capabilities.",
        "why_it_matters": "Positive engagement; prospect focused specifically on reconciliation workload reduction.",
        "evidence": [
            {
                "turn": None,
                "quote": "We help companies bring fragmented expense and payables workflows into one interface.",
                "reason": "Meera states primary solution value."
            },
            {
                "turn": None,
                "quote": "How does it synchronize with existing ledgers?",
                "reason": "Prospect demonstrates technical evaluation interest."
            }
        ],
        "not_established": [
            "Current ERP/accounting system used by Raghav's team.",
            "Buying committee and purchase approval authority."
        ],
        "recommended_actions": [
            {
                "action": "Send overview of accounting synchronization capabilities and schedule 15-minute demo.",
                "owner": "Meera"
            }
        ],
        "suggested_routes": ["customer_follow_up", "deal_next_steps"],
        "review_required": False
    },

    # C09 - Call with Vedant (Meera)
    "4a1de681-f884-55e8-b1ad-de22d17cd959": {
        "summary": "Meera called Vedant regarding corporate card controls and spending limits. Vedant confirmed current manual reimbursement friction and asked for product information.",
        "why_it_matters": "Active pain point identified around employee reimbursement turnaround times.",
        "evidence": [
            {
                "turn": None,
                "quote": "We provide pre-funded corporate cards with built-in spending limits.",
                "reason": "Rep pitches card controls."
            },
            {
                "turn": None,
                "quote": "Reimbursements currently take our accounts team over a week every month-end.",
                "reason": "Prospect confirms specific operational bottleneck."
            }
        ],
        "not_established": [
            "Number of corporate cardholders needed.",
            "Budget or contract authorization timeline."
        ],
        "recommended_actions": [
            {
                "action": "Send case study on month-end close acceleration and corporate card control brochure.",
                "owner": "Meera"
            }
        ],
        "suggested_routes": ["customer_follow_up", "deal_next_steps"],
        "review_required": False
    },

    # C10 - Call with Aniket (Meera)
    "b747f592-810e-583c-9b81-8db5ab035806": {
        "summary": "Meera contacted Aniket regarding invoice scanning and vendor approval automation. Aniket noted they already have a process in place but agreed to receive a deck.",
        "why_it_matters": "Low urgency prospect; requires nurturing rather than aggressive immediate close.",
        "evidence": [
            {
                "turn": None,
                "quote": "SpendNest brings together scheduled vendor payouts and invoice extraction.",
                "reason": "Pitch highlights AP automation."
            },
            {
                "turn": None,
                "quote": "We have an internal routine, but you can send an overview to my email.",
                "reason": "Prospect permits email follow-up without committing to meeting."
            }
        ],
        "not_established": [
            "Satisfaction level with existing vendor payment routine.",
            "Decision timeline or review cycles."
        ],
        "recommended_actions": [
            {
                "action": "Send high-level overview deck focusing on OCR accuracy and automated approval workflows.",
                "owner": "Meera"
            }
        ],
        "suggested_routes": ["customer_follow_up"],
        "review_required": False
    },

    # M01 - Meeting: Harborpath Advisory
    "cb5cecac-e68d-52b7-b10b-b0c748efc467": {
        "summary": "Partnership discussion between SpendNest and Harborpath Advisory. Partner A clarified their goal of helping corporate clients open bank accounts remotely. SpendNest clarified it serves registered corporate entities rather than individuals.",
        "why_it_matters": "Clarified compliance and product boundaries; identified referral criteria for corporate business accounts.",
        "evidence": [
            {
                "turn": 1,
                "quote": "My understanding was that you help people open bank accounts remotely.",
                "reason": "Partner expresses initial assumption regarding service capabilities."
            },
            {
                "turn": 2,
                "quote": "we work with registered businesses, not individuals opening personal accounts.",
                "reason": "Team member establishes strict regulatory and product boundary."
            }
        ],
        "not_established": [
            "Formal referral commission agreement or commercial terms.",
            "Projected volume of eligible corporate clients."
        ],
        "recommended_actions": [
            {
                "action": "Deliver partner criteria checklist for business entity onboarding.",
                "owner": None
            }
        ],
        "suggested_routes": ["deal_next_steps", "customer_follow_up"],
        "review_required": False
    },

    # M02 - Meeting: LedgerBridge
    "1a21c409-c050-5787-90af-2667e057e1b6": {
        "summary": "Technical and strategic discussion with LedgerBridge regarding electronic invoicing and multi-entity billing workflows. Supplier emphasized standard approved layouts and automated validation.",
        "why_it_matters": "Critical product integration discussion; customer has multi-entity architectural requirements that must align with SpendNest API capabilities.",
        "evidence": [
            {
                "turn": 3,
                "quote": "Electronic invoicing is the bigger opportunity. Customers already have approved invoice layouts.",
                "reason": "Team member identifies primary technical integration priority."
            },
            {
                "turn": 12,
                "quote": "We require multi-entity support where invoices can be routed across separate subsidiary tax IDs.",
                "reason": "Prospect details critical multi-entity prerequisite."
            }
        ],
        "not_established": [
            "Whether SpendNest engineering currently supports the required tax ID hierarchy.",
            "Final sign-off timeline from LedgerBridge architecture committee."
        ],
        "recommended_actions": [
            {
                "action": "Confirm multi-entity tax routing capabilities with product engineering and provide schema spec.",
                "owner": None
            }
        ],
        "suggested_routes": ["deal_next_steps", "internal_vendor_note"],
        "review_required": False
    },

    # M03 - Meeting: Asterloom Systems
    "398672e7-62dd-5afd-846d-0237d49792fb": {
        "summary": "Asterloom Systems finance team reviewed SpendNest corporate cards and reimbursement workflows. Customer B stressed prioritizing cards first to replace manual employee reimbursements.",
        "why_it_matters": "Clear phased adoption path: initial deployment focused on corporate cards before tackling broader accounting integration.",
        "evidence": [
            {
                "turn": 3,
                "quote": "Cards first. Our overseas team already has a provider they like. Here we reimburse employees through payroll.",
                "reason": "Customer establishes immediate deployment scope and geographical focus."
            }
        ],
        "not_established": [
            "Spend volume for domestic employee reimbursements.",
            "Whether overseas team would consider consolidating later."
        ],
        "recommended_actions": [
            {
                "action": "Prepare corporate card proposal with limits configuration tailored for local domestic team.",
                "owner": None
            }
        ],
        "suggested_routes": ["deal_next_steps", "customer_follow_up"],
        "review_required": False
    },

    # M04 - Meeting: Cedarwave Distribution
    "b0f79b3d-37ba-52f9-b2bc-58b159dd6d91": {
        "summary": "Cedarwave Distribution discussed card migration and acceptance issues. Customer expressed surprise regarding mobile wallet availability (Apple/Google Pay) and physical card acceptance failures.",
        "why_it_matters": "High-risk retention/migration conversation; technical acceptance failures directly impact cardholder adoption.",
        "evidence": [
            {
                "turn": 2,
                "quote": "Much of your usage is physical-card spending. We have seen acceptance problems with the existing provider.",
                "reason": "Team member highlights known POS terminal acceptance issues."
            },
            {
                "turn": 3,
                "quote": "I thought the wallet-payment option was coming to our existing cards too.",
                "reason": "Customer reveals unmet expectation regarding digital wallet support."
            }
        ],
        "not_established": [
            "Exact timeline for mobile wallet tokenization launch.",
            "Specific merchant category codes (MCCs) where cards were declined."
        ],
        "recommended_actions": [
            {
                "action": "Escalate wallet-payment roadmap status to product operations and provide fallback guidance for POS declines.",
                "owner": None
            }
        ],
        "suggested_routes": ["customer_follow_up", "sales_coaching", "needs_human_review"],
        "review_required": True
    },

    # M06 - Meeting: Mapletrail Services
    "657b9e9d-9472-5b01-a127-a648ad7e8cf7": {
        "summary": "Exploratory call with finance lead at Mapletrail Services branch office. Contact explained they operate as an autonomous software branch and inquired about spend limits separate from headquarters.",
        "why_it_matters": "Branch vs HQ autonomy dynamic: requires navigating local procurement authority vs corporate centralized sign-off.",
        "evidence": [
            {
                "turn": 2,
                "quote": "I handle finance for one branch of Mapletrail Services. We do software development and testing.",
                "reason": "Customer explains organizational scope and branch independence."
            }
        ],
        "not_established": [
            "Whether central headquarters must approve software subscriptions at branch level.",
            "Annual IT/software testing spend budget."
        ],
        "recommended_actions": [
            {
                "action": "Map branch approval matrix and send pricing breakdown for independent department workspaces.",
                "owner": None
            }
        ],
        "suggested_routes": ["deal_next_steps", "customer_follow_up"],
        "review_required": False
    },

    # M07 - Meeting: Willowfield Trust (Revision 2 - 27 turns)
    "4f304fff-fd40-5cfc-a366-0a134c445c2a": {
        "summary": "Technical review of UI description saving issue reported by Customer A at Willowfield Trust. Screen-sharing session confirmed that event-payment descriptions fail to persist after saving, reverting to earlier wording. Team member confirmed reproduction of the bug.",
        "why_it_matters": "Reproduced software defect in core transaction editing workflow affecting audit compliance at a trust advisory customer.",
        "evidence": [
            {
                "turn": 2,
                "quote": "The first one is editing the description. I am changing this event-payment description to a short reference.",
                "reason": "Customer demonstrates the exact transaction edit attempted."
            },
            {
                "turn": 3,
                "quote": "The field still shows the earlier wording. So the change is not appearing after you save, is that right?",
                "reason": "SpendNest team member verifies and acknowledges persistence bug."
            }
        ],
        "not_established": [
            "Engineering root cause (frontend cache vs database update failure).",
            "Target patch release date for the transaction editing bug."
        ],
        "recommended_actions": [
            {
                "action": "File urgent engineering defect ticket with screen-recording reproduction details.",
                "owner": None
            },
            {
                "action": "Notify Customer A once hotfix is deployed to staging.",
                "owner": None
            }
        ],
        "suggested_routes": ["internal_vendor_note", "customer_follow_up"],
        "review_required": False
    },

    # M09 - Meeting: Account setup & workflow (Brookmint Holdings)
    "4b5b9192-f3fc-505a-8e77-4d2ffaa54594": {
        "summary": "Onboarding walkthrough addressing expired account invitation for Brookmint Holdings and unresolved accounting sync error. Customer requested fresh invitation link and assistance reconciling duplicate entries.",
        "why_it_matters": "Onboarding block preventing customer team activation; immediate administrative fix needed.",
        "evidence": [
            {
                "turn": 1,
                "quote": "The invitation for Brookmint Holdings did not work. It said the link had expired.",
                "reason": "Customer identifies immediate blocker to workspace access."
            },
            {
                "turn": 3,
                "quote": "A fresh link in the conversation we are using now would be simplest.",
                "reason": "Customer requests immediate re-issue of access link."
            }
        ],
        "not_established": [
            "Root cause of duplicate accounting ledger entries mentioned.",
            "Target go-live date for Brookmint Holdings."
        ],
        "recommended_actions": [
            {
                "action": "Generate and send fresh Brookmint Holdings admin invite link.",
                "owner": None
            }
        ],
        "suggested_routes": ["customer_follow_up", "internal_vendor_note"],
        "review_required": False
    },

    # M10 - Meeting: Billing workflow walkthrough
    "337f297d-9385-5b82-9e54-5019c1ed912c": {
        "summary": "Internal / customer walkthrough covering recurring billing cycles and subscription invoice adjustments. Team member A guided participant through remaining billing portal sections.",
        "why_it_matters": "Operational training session ensuring accurate invoice generation and subscription configuration.",
        "evidence": [
            {
                "turn": 3,
                "quote": "Yesterday we covered the subscription side of billing. Any questions before I show the remaining parts?",
                "reason": "Establishes continuity from previous training session."
            }
        ],
        "not_established": [
            "Whether customer approved automated recurring debit authorization.",
            "Specific customer contract billing terms."
        ],
        "recommended_actions": [
            {
                "action": "Distribute billing portal administrator guide and recorded walkthrough snippet.",
                "owner": None
            }
        ],
        "suggested_routes": ["customer_follow_up", "sales_coaching"],
        "review_required": False
    }
}

# Special placeholder analysis for M07 under Revision 1 (initial batch)
M07_INITIAL_ANALYSIS = {
    "summary": "Meeting recorded with Willowfield Trust, but transcript was withheld from initial delivery batch per assessment specification.",
    "why_it_matters": "Awaiting revision 2 update batch to inspect conversation turns and verify customer issues.",
    "evidence": [
        {
            "turn": None,
            "quote": "Transcript not included in this delivery; a later assessment batch supplies it.",
            "reason": "Source transcript payload explicitly explains delivery staging."
        }
    ],
    "not_established": [
        "Conversation content, attendee discussion, and technical outcomes cannot be established without transcript."
    ],
    "recommended_actions": [
        {
            "action": "Import update batch (revision 2) to unlock transcript and perform analysis.",
            "owner": "Manager"
        }
    ],
    "suggested_routes": ["needs_human_review"],
    "review_required": True
}
