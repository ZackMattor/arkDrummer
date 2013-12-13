arkDrummer
==========

A drum sequencer on the web.

What the heck is this going to do you ask?

The point of this is for me to play around with the audio API.. That's pretty much it. I kind of want to make it production-ready and see if I can get people into it.

The Project.... When you hit new... you make a new project :)

The Sequences.... One of the main data-types are the sequences. These are basically one-measure long drum beats. they will appear on the right of the screen with a human-readable name that you can select between. Once selected the "sequence" will show up in the main sequence editor to the right of this section.

The Drum Types... This is just a way to categories different drum types such as Snare, Kick, Open HighHat, Closed HighHat etc. There will be a way to create new ones for weird sounds. When you swap between kits this will stay constant do you can use different kits with the same sequence.

The Kits.... The other major part of this are the drum kits. These are groups of wav files that make up the drum kit. Each drum will have an id to the drum type, a path to the wav file, and the whole kit will also have a name.

The Timeline.... Once you have a bunch of sequences you can group them together in the Timeline. This will allow you to repeat one sequence numerous times and add other sequences as fills, breakdowns, etc. After they are all lined up you can press play and listen to your finished beat.
