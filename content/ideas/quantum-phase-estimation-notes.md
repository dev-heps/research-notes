---
title: Quantum Phase Estimation — Mathematical Notes
status: Study Note
summary: Notes on the mathematical structure of the Quantum Phase Estimation algorithm, including eigenvalue extraction from unitary operators.
---

# Quantum Phase Estimation — Mathematical Notes

## Setup

Let U be a unitary operator on a Hilbert space H, and |psi> be an eigenvector:

U|psi> = e^(2*pi*i*theta)|psi>, theta in [0, 1)

The goal of QPE is to estimate theta to n bits of precision.

## Algorithm Sketch

1. Prepare ancilla register in |0>^n and eigenstate |psi>
2. Apply Hadamard to ancilla: H^(otimes n)|0>^n
3. Apply controlled-U^(2^k) gates for k = 0, ..., n-1
4. Apply Inverse QFT to ancilla register
5. Measure ancilla to obtain approximation of theta

## Key Mathematical Objects

- **Quantum Fourier Transform (QFT):** A unitary implementing the DFT on the computational basis
- **Phase kickback:** The mechanism by which controlled-U writes phase into the ancilla
- **Eigenphase:** theta such that U|psi> = e^(2*pi*i*theta)|psi>

## Complexity

QPE achieves precision epsilon with O(1/epsilon) calls to controlled-U and O(n^2) elementary gates for the inverse QFT, where n = ceil(log2(1/epsilon)).

## Connection to Mathematical Biology

QPE is central to quantum simulation algorithms (e.g., Hamiltonian simulation), which have potential applications to modeling biological quantum effects (e.g., photosynthesis, enzyme catalysis).
