---
title: Quantum State Encoding for Biological Dynamical Systems
status: Working Hypothesis
summary: Exploring Carleman linearization to map nonlinear biochemical ODEs onto unitary quantum state evolutions.
---

# Quantum State Encoding for Biological Dynamical Systems

## 1. Research Question
Can nonlinear metabolic and biochemical reaction networks be mapped efficiently into linear infinite-dimensional Hilbert spaces for quantum simulation?

## 2. Proposed Hypothesis & Framework
Applying **Carleman Linearization** transforms a finite-dimensional nonlinear ODE:

$$\frac{d\mathbf{x}}{dt} = \mathbf{F}(\mathbf{x})$$

into a countable system of linear ODEs in terms of monomial vectors $\mathbf{y} = [x_1, x_2, x_1^2, x_1 x_2, \dots]^T$:

$$\frac{d\mathbf{y}}{dt} = \mathbf{A} \mathbf{y}$$

## 3. Potential Quantum Approach
- Embed truncated linear system into unitary operations via the **Quantum Linear System Algorithm (QLSA)** or **HHL framework**.
- Evaluate gate complexity vs. truncation error $\epsilon$.

## 4. Next Steps
- [ ] Implement 2-variable Lotka-Volterra Carleman linearization in Python.
- [ ] Simulate small-scale state vector evolution using Qiskit.
