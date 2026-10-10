# live-sync-4: data-model compatibility check and recording the deploy-route approval
Problem: before main can be deployed over live, we need to know whether main's models fit the live DB, and Andy's approval of the mos-gemini deploy route needs recording.
Assessment: a read-only schema comparison (sqlite mode=ro, schema only) found the shared tables identical and three tables that exist only in main. Creating them on start would be an additive migration, which needs Andy's decision.
