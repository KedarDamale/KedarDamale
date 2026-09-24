RESUME_DIR := resume
RESUME_VERSION ?= $(shell date -u +%Y%m%d)
LATEX := lualatex
LATEX_FLAGS := -interaction=nonstopmode -halt-on-error
ATS_PROVIDER ?= auto
ATS_MODEL ?=
ATS_EFFORT ?=
ATS_ROLE ?=
ATS_COMPANY_CONTEXT ?=
ATS_INTERACTIVE ?= 1
ATS_RESUME ?= portfolio/main.pdf
ATS_JOB ?=

.PHONY: resume resume-clean ats ats-setup ats-mcp

resume:
	cd $(RESUME_DIR) && $(LATEX) $(LATEX_FLAGS) main.tex && $(LATEX) $(LATEX_FLAGS) main.tex
	bash scripts/publish-resume.sh $(RESUME_DIR)/main.pdf $(RESUME_VERSION)

resume-clean:
	cd $(RESUME_DIR) && rm -f main.aux main.log main.out main.pdf

ats:
	python3 scripts/ats.py $(if $(filter 1,$(ATS_INTERACTIVE)),--interactive,) --resume "$(ATS_RESUME)" --provider "$(ATS_PROVIDER)" $(if $(ATS_JOB),--job-description "$(ATS_JOB)",) $(if $(ATS_MODEL),--model "$(ATS_MODEL)",) $(if $(ATS_EFFORT),--effort "$(ATS_EFFORT)",) $(if $(ATS_ROLE),--role "$(ATS_ROLE)",) $(if $(ATS_COMPANY_CONTEXT),--company-context "$(ATS_COMPANY_CONTEXT)",)

ats-setup:
	python3 scripts/ats_mcp.py --setup

ats-mcp:
	python3 scripts/ats_mcp.py
