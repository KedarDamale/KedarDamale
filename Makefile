RESUME_DIR := resume
RESUME_VERSION ?= $(shell date -u +%Y%m%dT%H%M%SZ)
LATEX := pdflatex
LATEX_FLAGS := -interaction=nonstopmode -halt-on-error

.PHONY: resume resume-clean

resume:
	cd $(RESUME_DIR) && $(LATEX) $(LATEX_FLAGS) main.tex && $(LATEX) $(LATEX_FLAGS) main.tex
	bash scripts/publish-resume.sh $(RESUME_DIR)/main.pdf $(RESUME_VERSION)

resume-clean:
	cd $(RESUME_DIR) && rm -f main.aux main.log main.out main.pdf
