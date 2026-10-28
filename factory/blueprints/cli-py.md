# Blueprint: cli-py

## When
Command-line tools: security scanners, file analyzers, memory/forensics tools, converters, anything
run from a terminal on one machine. Defensive security only.

## Stack
Python 3.12, uv, typer (CLI), rich (output), pydantic (models), pytest, ruff, mypy (strict), bandit.
Heavy lifting: use the established library for the domain (`yara-python`, `pefile`, `lief`,
`volatility3`, `capstone`) rather than reimplementing parsers.

## Scaffold
```
uv init --package --python 3.12 .
uv add typer rich pydantic
uv add --dev pytest pytest-cov ruff mypy bandit pyinstaller
```

## Layout
```
src/<pkg>/cli.py        typer app; thin, no logic
src/<pkg>/core/         pure logic, typed, testable
src/<pkg>/models.py     pydantic models
src/<pkg>/output.py     rich tables + --json
tests/                  pytest, fixtures under tests/fixtures/
```

## factory.json commands
```json
"install":   "uv sync",
"lint":      "uv run ruff check . && uv run ruff format --check .",
"typecheck": "uv run mypy src",
"test":      "uv run pytest -q",
"build":     "uv build",
"audit":     "uv run bandit -q -r src",
"run":       "uv run <pkg> --help",
"release":   "uv build && uv run pyinstaller --onefile -n <slug> src/<pkg>/__main__.py"
```

## Standards
Every command has `--json` output and a non-zero exit code on findings when `--fail-on` is set.
Never execute or detonate samples. Read-only on inputs. Progress bars for anything over 2 seconds.
`--help` is the documentation; README mirrors it.

## Scalability
Stream large files; never read whole into memory unless under a size cap. Multiprocessing for
per-file work with a `--jobs` flag. Results as newline-delimited JSON for piping.

## Release
`uv build` to PyPI (`uv publish`), plus a PyInstaller single binary attached to the GitHub release.
