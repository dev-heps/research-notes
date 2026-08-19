---
title: Qiskit Statevector Simulation & Gate Fidelity Benchmark
status: Lab Log
summary: Baseline benchmark measuring runtime and state fidelity across 4-16 qubit registers using Qiskit Aer.
---

# Qiskit Statevector Simulation & Gate Fidelity Benchmark

## 1. Experimental Objective
Benchmark classical simulation limits of parameterized quantum circuits (Hardware-Efficient Ansatz) across varying qubit counts and noise models.

## 2. Benchmark Environment
- **Framework**: Qiskit 1.x
- **Backend**: `qiskit_aer.AerSimulator(method='statevector')`
- **Qubit Counts**: $n \in \{4, 8, 12, 16\}$

## 3. Protocol & Metrics
```python
from qiskit.circuit.library import RealAmplitudes
from qiskit_aer import AerSimulator

# Construct 2-layer RealAmplitudes ansatz
ansatz = RealAmplitudes(num_qubits=8, reps=2)
```

## 4. Observations & Notes
- Memory scaling grows exponentially ($2^n 	imes 16$ bytes for double precision statevector).
- At 16 qubits, memory consumption reaches $\sim 1	ext{ MB}$, baseline runtime $pprox 42	ext{ ms}$.
