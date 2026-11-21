# Dell Services Makefile

INVENTORY_MD = INVENTORY.md
PROTECTED_UNITS = omniroute golden-line eggbot-watchdog local-dell-llama stt-improve-loop

.PHONY: check inventory restart-all

check:
	@echo "Checking dell-services..."
	@for d in *; do \
	  if [ -d "$$d" ] && [ -f "$$d/check.sh" ]; then \
	    echo "Running $$d/check.sh..."; \
	    (cd "$$d" && ./check.sh) || exit 1; \
	  fi; \
	done
	@echo "All service checks passed."

inventory:
	@python3 /home/andy/chapelgate/dell-services/inventory-gen.py
	@echo "Inventory generated: $(INVENTORY_MD)"

restart-all:
	@echo "Restarting services (excluding protected)..."
	@for u in $$(systemctl --user list-units --type=service --no-legend | cut -d" " -f1); do \
	  is_protected=0; \
	  for p in $(PROTECTED_UNITS); do \
	    if [[ "$$u" == *"$$p"* ]]; then is_protected=1; fi; \
	  done; \
	  if [ $$is_protected -eq 0 ]; then \
	    echo "Restarting $$u..."; \
	    systemctl --user restart "$$u"; \
	  else \
	    echo "Skipping protected unit: $$u"; \
	  fi; \
	done
