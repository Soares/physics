This repository is a grab bag of physics simulations that I've written over
time. Basically, when I'm trying to understand a physical concept and I think a
visualization will help, I hack one together and toss it in here. As a result,
the code here is generally undocumented, and probably not super easy to
understand. Below I provide two roadmaps, one of which just tells how to
view various pretty visualizations, plus a very high-level sketch of the code
base in case you want to make your own visualization or extend the tools I
wrote.

Warning: the visualizations are very much based on what I needed in a particular
moment in time to understand a particular concept; none of them have
explanations attached; I'm not confident that they'll be useful to most people
in general (unless they happen to have the same confusions I had, and a lot of
skill in figuring out what the hell they're looking at).

# How to view the visualizations:

1. Open one of the html files in your browser. It should Just Work. You might
   need to fiddle with your browser settings to let local files run javascript,
   I'm not sure. Currently, the files are:
  - classical.html: A classical mechanics simulator. This contains some
    visualizations for understanding gravity, coriolis forces, angular momentum, and changing coordinate systems. One day I might add some visualizations of electric and magnetic forces to it.
  - phase.html: I use this to visualize phase spaces. This includes tools for
    visualizing simple Lagrangians (for, e.g., a single 1D particle), and visualizing the flow of points through simple phase spaces (again, for single 1D particles; it's hard to visualize a phase space for anything bigger than that in 3D)
  - vecfields.html: I use this to visualize different vector fields, and things
    like their grad, div, and curl.
  - wavefns.html: I use this to visualize quantum wave functions. Right now it
    contains visualizations for single 1D particles moving around, and for
    little harmonic oscillators, and for some simple collections of Qbits.
2. As you can see from the above descriptions, each html file contains a bunch
   of different visualizations. At the moment you have to switch between them
   manually, by opening the html file, scrolling to the bottom, and changing
   which "js/env" script is active. Each html file should contain a collection
   of all the environments compatible with that particular file, and all but one
   will be inactive (commented out) on any given run.
  - Note: in classical.html, you can also control how many simultaneous viewports you have, also by commenting/uncommenting the code that sets up the extra viewports (it should be pretty obvious by skimming the file). Different visualizations use between 1 and 4 viewports; if a visualization is broken you probably need to add more viewports.

The most fun one to observe / show off is the js/env/twistyWave.js visualization
in wavefns.html.

# Rough overview of the code

- All the HTML files are at the top level, and they're all pretty dirt-simple.
- You can ignore the approximations/ directory, it contains some tensorflow code
  for finding paths of least action for a given Lagrangian via gradient descent.
- You can ignore the theorems/ directory, it contains some Haskell code that I
  write (pretending I'm using a theorem prover) when I really want to grok a
  particular theorem.
- You can ignore the css/ directory unless you want to tweak the style of the
  visualizations, in which case, go to town on css/main.css
- All the interesting visualization code is in js/.
  - Third party code goes in js/thirdParty. That's mostly just three.js plus a
    fast fourier transform library I found on github.
  - All other common tools used to build visualizations are in js/lib. Modules
    there serve a few different purposes:
      1. Provide basic mathematical utilities, like vectors, affine
         transformation utilities, and so on.
      2. Provide generic controls for doing things like changing the speed or
         fidelity of a simulation.
      3. Provide generic tools for rendering dynamic 2D worlds.
      4. Provide generic tools for rendering dynamic 3D worlds (via three.js).
      5. Provide generic tools for giving the user readouts of different stats
         (like total energy in the system)
      6. Collect a bunch of common tools used to make physics simulations (like
         tools for calculating potential energy, or for taking a Hamiltonian and
         producing a function that evolves a wave function for an arbitrary
         amount of time).
      Hopefully you can tell which is which by looking at the names of the
      files. Good luck.
  - The configuration of various visulaizations themselves are in js/env.
