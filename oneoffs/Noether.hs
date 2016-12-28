n : Nat   -- Number of particles
d : Nat   -- Number of dimensions

R+ = (α : R, α > 0)

PosConfig : n -> R
VelConfig : n -> R

x : (t : [0, 1]) -> PosConfig

.x : (t : [0, 1]) -> VelConfig
.x = derive x "t"

L : (q : PosConfig, .q : VelConfig) -> R

Force : (PosConfig, VelConfig) -> (n -> R)
Force = derive L "q"

Momentum : (PosConfig, VelConfig) -> (n -> R)
Momentum = derive L ".q"

Mask = (n -> R) -> (n -> R)

translation : Mask -> (PosConfig, VelConfig) -> (α : R) -> (n : Nat) -> (PosConfig, VelConfig)
translation m α 0 (x, .x) = (x, .x)
translation m α 1 (x, .x) = (translate x, ((translate $ next x) - translate x) / α) where
  translate y = y + (α * (m y)),
  next x = x + (α * .x)
translation m α (S n) (x, .x) = translation m (α * n / S n) n (translation m (α / S n) 1 (x, .x))

vel : (q : ([0, 1] -> PosConfig)) -> (t : [0, 1]) -> VelConfig
vel q t = lim δ 0 (q (t + δ) - q t) / δ

isOnShell : (q : ([0, 1] -> PosConfig)) -> (t : [0, 1]) -> (Force (q t, vel q t) == lim δ 0 (Momentum (q t + δ, vel q t + δ) - Momentum (q t, vel q t)) / δ)

isSymmetry : (m : Mask) -> α -> (ε : R, ε > 0) -> (δ : R, (x : PosConfig, .x : VelConfig) ->  abs (L (x, .x) - L (translation m α (α / δ) (x, .x))) < ε)

isConserved : (f : ([0, 1] -> R)) -> (t0 : [0, 1]) -> (t1 : [0, 1]) -> (f t0 == f t1)

Noether : (m : Mask, isSymmetry m) -> (q : ([0, 1] -> PosConfig), isOnShell q) -> isConserved (\t -> dot m (Momentum (q t) (vel $ q t)))
