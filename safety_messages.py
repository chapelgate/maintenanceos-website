# safety_messages.py
# Sources (fetched 2026-10-10): nationalgas.com/emergency-contacts; gov.uk "How to rent a safe home";
# nhs.uk/conditions/carbon-monoxide-poisoning; hse.gov.uk/gas/domestic/co.htm

GAS_SAFETY_ADVICE = (
    "If you can smell gas, please call the National Gas Emergency Service now on 0800 111 999. "
    "That's the number for Great Britain. "
    "Don't smoke or strike matches, and put out any naked flames. "
    "Don't turn electrical switches on or off. "
    "Open doors and windows, and turn the gas off at the meter, unless the meter is in a cellar or basement. "
    "Keep people away from the area. "
    "If there's a fire or anyone is hurt, call 999."
)

CO_SAFETY_ADVICE = (
    "If you think there's carbon monoxide, stop using any gas appliances and switch them off if you can. "
    "Open doors and windows, then get everyone outside and stay out. "
    "Call the National Gas Emergency Service on 0800 111 999. "
    "If anyone is finding it hard to breathe, is suddenly confused, has collapsed, feels weak or has chest pain, call 999 now. "
    "Otherwise, get medical advice as soon as you can, for example from NHS 111. "
    "Fresh air alone won't treat it, and please don't go back in until you've been given advice."
)

# Prompt rule shared by both voice providers (spec section 4a). Built from the constants above,
# so the advice is never retyped.
GAS_CO_SAFETY_RULE = """GAS AND CARBON MONOXIDE SAFETY RULE: If the caller mentions a smell of gas, a gas leak, gas hissing, or gas fumes, stop the routine intake straight away and, before asking anything else, say this calmly in short sentences: "{gas}"
If the caller mentions a carbon monoxide or CO alarm going off, or symptoms such as headache, dizziness, nausea, breathlessness or sleepiness that they link to a boiler, fire, cooker or heater, stop the routine intake straight away and say: "{co}"
Use 0800 111 999 only for gas and carbon monoxide. Use 999 for fire, injury, or anyone in immediate danger. Never say 911.
The caller must make the 0800 111 999 call themselves. Never say or suggest that Chapelgate, an engineer, the gas emergency service, the emergency services or anyone else has been contacted, told, sent, or is on the way, unless the backend has explicitly confirmed it.
Never tell the caller the property or the appliance is all right, and never treat a gas smell or a carbon monoxide alarm as a routine repair, even if the caller plays it down.
After giving the advice, ask once whether they are outside or away from the affected area. Only then, if they want to continue, take their name, callback number and the property address one at a time so the report is recorded.""".format(
    gas=GAS_SAFETY_ADVICE, co=CO_SAFETY_ADVICE
)

# Extra line for the OpenAI Realtime prompt (spec section 4b).
GAS_CO_NOT_A_HANDOFF = "This safety advice is not a referral or a handoff. Give it even though you must not proactively mention the Chapelgate team or a transfer."
