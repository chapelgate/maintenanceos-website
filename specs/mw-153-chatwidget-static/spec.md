# mw-153 ChatWidget dead-form cleanup
ChatWidget currently renders a functional-looking form with onSubmit, Enter-key submit, success state, and form.reset() — all dead code because the widget is disclosure-only (static site, no chat backend). This slice removes the form machinery entirely, keeping only the trigger button and the honest disclosure panel with mailto link.
