RESUME_DIR := resume
RESUME_VERSION ?= $(shell git log -1 --format=%cs -- resume | tr -d '-')
LATEX := lualatex
LATEX_FLAGS := -interaction=nonstopmode -halt-on-error
ATS_PROVIDER ?= auto
ATS_MODEL ?=
ATS_EFFORT ?=
ATS_ROLE ?=
ATS_COMPANY_CONTEXT ?=
ATS_INTERACTIVE ?= 1
ATS_RESUME ?= $(or $(lastword $(sort $(wildcard output/resume-????????.pdf))),resume/main.tex)
ATS_JOB ?=

.PHONY: resume resume-clean ats ats-setup ats-mcp

resume:
	RESUME_VERSION="$(RESUME_VERSION)" RESUME_DIR="$(RESUME_DIR)" LATEX="$(LATEX)" LATEX_FLAGS="$(LATEX_FLAGS)" bash scripts/build-resume.sh

resume-clean:
	cd $(RESUME_DIR) && rm -f main.aux main.log main.out main.pdf

ats:
	python3 scripts/ats.py $(if $(filter 1,$(ATS_INTERACTIVE)),--interactive,) --resume "$(ATS_RESUME)" --provider "$(ATS_PROVIDER)" $(if $(ATS_JOB),--job-description "$(ATS_JOB)",) $(if $(ATS_MODEL),--model "$(ATS_MODEL)",) $(if $(ATS_EFFORT),--effort "$(ATS_EFFORT)",) $(if $(ATS_ROLE),--role "$(ATS_ROLE)",) $(if $(ATS_COMPANY_CONTEXT),--company-context "$(ATS_COMPANY_CONTEXT)",)

ats-setup:
	python3 scripts/ats_mcp.py --setup

ats-mcp:
	python3 scripts/ats_mcp.py
