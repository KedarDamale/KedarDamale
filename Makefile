RESUME_DIR := resume
RESUME_VERSION ?= $(shell date -u +%Y%m%d)
LATEX := lualatex
LATEX_FLAGS := -interaction=nonstopmode -halt-on-error
ATS_PROVIDER ?= auto
ATS_RESUME ?= resume/main.tex
ATS_JOB ?=

.PHONY: resume resume-clean ats ats-setup ats-mcp

resume:
	cd $(RESUME_DIR) && $(LATEX) $(LATEX_FLAGS) main.tex && $(LATEX) $(LATEX_FLAGS) main.tex
	bash scripts/publish-resume.sh $(RESUME_DIR)/main.pdf $(RESUME_VERSION)

resume-clean:
	cd $(RESUME_DIR) && rm -f main.aux main.log main.out main.pdf

ats:
	python3 scripts/ats.py --resume "$(ATS_RESUME)" --provider "$(ATS_PROVIDER)" $(if $(ATS_JOB),--job-description "$(ATS_JOB)",)

ats-setup:
	python3 scripts/ats_mcp.py --setup

ats-mcp:
	python3 scripts/ats_mcp.py
