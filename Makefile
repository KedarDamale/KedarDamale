RESUME_DIR := resume
LATEX := pdflatex
LATEX_FLAGS := -interaction=nonstopmode -halt-on-error

.PHONY: resume resume-clean

resume:
	cd $(RESUME_DIR) && $(LATEX) $(LATEX_FLAGS) main.tex && $(LATEX) $(LATEX_FLAGS) main.tex

resume-clean:
	cd $(RESUME_DIR) && rm -f main.aux main.log main.out main.pdf
