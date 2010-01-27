// ihacreslab: rainfall-runoff hydrology models and tools
//
// Copyright (c) 2008 Felix Andrews <felix@nfrac.org>


#include <R_ext/Arith.h>

#include <R.h>

#ifndef min
#define min(a, b) ((a < b)?(a):(b))
#define max(a, b) ((a < b)?(b):(a))
#endif

#define my_isok(x) (!ISNA(x) & !ISNAN(x))


void
sma_cmd(double *P, double *E, int *n,
	double *d, double *g, double *e, double *M_0, double *U)
{
	int t;
	double Mf;
	double M_prev = *M_0;
	double ET;
	for (t = 0; t < *n; t++) {
		// rainfall reduces CMD (Mf)
		if (P[t] > 0) {
			if (M_prev < *d) {
				Mf = M_prev * exp(-P[t] / *d);
			} else if (M_prev < *d + P[t]) {
				Mf = *d * exp((-P[t] + M_prev - *d) / *d);
			} else {
				Mf = M_prev - P[t];
			}
		} else {
			Mf = M_prev;
		}
		// drainage (rainfall not accounted for in -dM)
		U[t] = max(0, P[t] - M_prev + Mf);
		// evapo-transpiration
		ET = *e * E[t] * min(1, exp(2 * (1 - Mf / *g)));
		ET = max(0, ET);
		// mass balance
		M_prev = M_prev - P[t] + U[t] + ET;
		M_prev = max(0, M_prev);
	}
}

