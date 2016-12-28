Physics for programmers:
- Fully general systems
- physical systems are a subset of these systems
- why? hard to say, one decent guess is that it's among the simpler systems that has folk in it.

- The Grand Bijection

- A WorldState is going to be just a big ol list of numbers.
- let's start with a simple example.
- we'll have point particles, and they'll have mass and position
- and we'll also at *least* want to know the velocity
- bc [ex1] and [ex2] are very different systems!
- so, we have
- m, x and v-type numbers.
- to get the next one, we use the following rules:
- m things don't change
- shove v*∆ into x.
- affect v*∆ somehow.
- now, we could add another type; a-type numbers. and shove a*∆ into v.
- and then j-type numbers, and shove j*∆ into a. And so on.
- this would let us specify any type of system at all!
- tis a fully general continuous system
- physical systems are a subset of that kind of system.

- but we won't. Instead, we'll define a global function for each v, which takes *all* xs and says how to change that v.
- we'll make it harder to change the v of massive things
- and we'll call it a "force function"
- v_i ← v_i + ∆ * F_i({x})/m_i
- let's review.
- a worldstate is 3N numbers, we needed a way to hook worldstates up, the velocities pour into the positions and we needed a way to change the velocities, we just define one and call it "force".
- A few notes here:
1. we can either specify an arbitrary "force" or we can measure how momentum is changing and call that "force"
2. what is a force? it's not really a physical thing, rather, we looked at the velocities and they were changing and we figured out how they were changing, that's a function (as it happens) of all positions
3. why didn't we have the force act directly on the positions? We coulda! This isn't what we observe. And, we wouldn't be able to use the same force function for the same "rules" with different "starting velocities", so while we could still get at the same general system, it would give us less ability to characterize a *type* of system. But, of course, it gives us more general ability; e.g., accel doesn't need to be continuous.
4. there's still a lot of arbitrary crap here (the fundamental mass, the division of axes into multiple dimensions, etc.), we'll work on all those things later; for now, nah.
- examples examples examples

- now, this still isn't very restrictive
- and obviously it's not super physical
- examples examples
- are there any constraints we've learned on admissible force functions?
- Yep! The first one is "equal and opposite reaction"
- yes yes no examples
- prove conservation of momentum
- note that sometimes we pretend this isn't the case
- realistic negative example, w ball and wall or something
- explain how realistic example would work

- the other big restriction is this:
- forces can always be computed by looking at the gradient of some function
- specifically, F_i = -dW/dxi for some W.
- we call this "potential energy"
- here's the rough reason:
- [explanations of kinetic and potential energy]

