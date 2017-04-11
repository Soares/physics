'use strict';
// modified version to run on state vectors instead of complex arrays.
// see lib/fft for license.

function FFT(input, inverse) {
  const n = input.dim;
  if (n & (n - 1)) {
    return FFT_Recursive(input, inverse);
  } else {
    return FFT_2_Iterative(input, inverse);
  }
}

const FFT_Recursive = (input, inverse) => {
  const n = input.dim;
  const output_r = new Float32Array(n);
  const output_i = new Float32Array(n);

  if (n === 1) {
    return input
  }

  // Use the lowest odd factor, so we are able to use FFT_2_Iterative in the
  // recursive transforms optimally.
  const p = lowestOddFactor(n)
  const m = n / p
  const normalisation = 1 / Math.sqrt(p)
  let recursive_result = {
    dim: m,
    re: new Float32Array(m),
    im: new Float32Array(m),
  };

  // Loops go like O(n Σ p_i), where p_i are the prime factors of n.
  // for a power of a prime, p, this reduces to O(n p log_p n)
  for(let j = 0; j < p; j++) {
    for(let i = 0; i < m; i++) {
      recursive_result.re[i] = input.re[i * p + j]
      recursive_result.im[i] = input.im[i * p + j]
    }
    // Don't go deeper unless necessary to save allocs.
    if (m > 1) {
      recursive_result = FFT(recursive_result, inverse)
    }

    // Complex multiplier and its delta.
    const del_f_r = Math.cos(TAU*j/n)
    const del_f_i = (inverse ? -1 : 1) * Math.sin(TAU*j/n)
    let f_r = 1
    let f_i = 0

    for(let i = 0; i < n; i++) {
      const _real = recursive_result.re[i % m]
      const _imag = recursive_result.im[i % m]

      output_r[i] += f_r * _real - f_i * _imag;
      output_i[i] += f_r * _imag + f_i * _real;

      [f_r, f_i] = [f_r * del_f_r - f_i * del_f_i, f_r * del_f_i + f_i * del_f_r];
    }
  }

  // Copy back to input to match FFT_2_Iterative in-placeness
  // TODO: faster way of making this in-place?
  for(let i = 0; i < n; i++) {
    input.re[i] = normalisation * output_r[i];
    input.im[i] = normalisation * output_i[i];
  }
  return input;
};

const FFT_2_Iterative = (input, inverse) => {
  const n = input.dim;
  const output = bitReverseComplexArray(input);
  const output_r = output.re;
  const output_i = output.im;

  // width is of each sub-array for which we're iteratively calculating FFT.
  // Loops go like O(n log n):
  //   width ~ log n; i,j ~ n
  let width = 1;
  while (width < n) {
    // Complex multiplier delta
    const del_f_r = Math.cos(TAU/(2*width));
    const del_f_i = (inverse ? -1 : 1) * Math.sin(TAU/(2*width));
    for (let i = 0; i < n/(2*width); i++) {
      // Complex multiplier
      let f_r = 1;
      let f_i = 0;
      for (let j = 0; j < width; j++) {
        const l_index = 2*i*width + j;
        const r_index = l_index + width;

        const left_r = output_r[l_index];
        const left_i = output_i[l_index];
        const right_r = f_r * output_r[r_index] - f_i * output_i[r_index];
        const right_i = f_i * output_r[r_index] + f_r * output_i[r_index];

        output_r[l_index] = Math.SQRT1_2 * (left_r + right_r);
        output_i[l_index] = Math.SQRT1_2 * (left_i + right_i);
        output_r[r_index] = Math.SQRT1_2 * (left_r - right_r);
        output_i[r_index] = Math.SQRT1_2 * (left_i - right_i);

        [f_i, f_r] = [f_r * del_f_i + f_i * del_f_r, f_r * del_f_r - f_i * del_f_i];
      }
    }
    width <<= 1;
  }
  return output;
};

const bitReverseIndex = (index, n) => {
  var bitreversed_index = 0
  while (n > 1) {
    bitreversed_index <<= 1;
    bitreversed_index += index & 1;
    index >>= 1;
    n >>= 1;
  }
  return bitreversed_index;
};

const bitReverseComplexArray = (input) => {
  const n = array.dim, flips = {};
  for(let i = 0; i < n; i++) {
    var r_i = bitReverseIndex(i, n);
    if (flips.hasOwnProperty(i) || flips.hasOwnProperty(r_i)) continue;
    [array.re[r_i], array.re[i]] = [array.re[i], array.re[r_i]];
    [array.im[r_i], array.im[i]] = [array.im[i], array.im[r_i]];
    flips[i] = flips[r_i] = true;
  }
  return array;
};


const lowestOddFactor = (n) => {
  let factor = 3;
  const sqrt_n = Math.sqrt(n);
  while(factor <= sqrt_n) {
    if (n % factor === 0) {
      return factor;
    }
    factor += 2;
  }
  return n;
};
