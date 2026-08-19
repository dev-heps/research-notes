---
title: Variational Quantum Algorithms & VQE Overview
authors: McArdle et al.
year: 2020
status: Literature Review
link: https://arxiv.org/abs/1808.10402
summary: Critical summary of hybrid quantum-classical algorithms, parameterized ansatz circuits, and ground state energy estimation.
---

# Variational Quantum Algorithms & VQE Overview

## 1. Problem Definition & Motivation
In the Noisy Intermediate-Scale Quantum (NISQ) era, deep quantum circuits suffer from decoherence and gate infidelities. **Variational Quantum Algorithms (VQAs)** mitigate circuit depth requirements by delegating optimization loops to classical optimizers.

## 2. Core Mathematical Formulation
The Variational Quantum Eigensolver (VQE) targets finding the ground state energy $E_0$ of a given Hamiltonian $H$:

$$E_0 \le \langle \psi(oldsymbol{	heta}) | H | \psi(oldsymbol{	heta}) angle$$

Where:
- $|\psi(oldsymbol{	heta})angle = U(oldsymbol{	heta})|0angle$ is the parameterized trial state (ansatz).
- $oldsymbol{	heta}$ is optimized via classical gradient descent or SPSA.

## 3. Key Observations & Bottlenecks
- **Barren Plateaus**: Gradient vanishing exponentially with the number of qubits ($O(e^{-n})$) in deep, random ansatz architectures.
- **Shot Noise**: Measurement variance scaling with $1/\sqrt{N_{	ext{shots}}}$.

## 4. Relevance to Research
Template for evaluating Hamiltonian mappings and comparing convergence profiles on biological molecular simulations.
