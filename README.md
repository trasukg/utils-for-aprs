# Utilities for APRS under Node.js

APRS is the Advanced Packet Reporting System, designed by Bob Bruninga, WB4APR.

It uses the Un-numbered Information (UI) packets of the AX.25 protocol to allow
for stations to broadcast small information packets and messages to the other
stations in the surrounding area (typically the local area covered by a digital
repeater, or digipeater).

This module is a set of utilities for dealing with "RF" packets, in other words
the part of APRS that involves connecting a computer to a packet modem and
then to a radio, in order to monitor and send APRS information over the air
in a local area.  Currently these utilities don't deal with 'APRS-IS',
the internet server part of APRS.  That may happen in the future, but right now
the focus is on making it possible to deploy a portable station that uses
modern techniques to provide an APRS client.

As I start this effort in 2016, the two most popular APRS clients for Linux
systems (like the RPi) seem to be [Xastir](https://xastir.org) and
[YAAC - Yet Another APRS Client](http://ka2ddo.org/ka2ddo/YAAC.html).

Although these two clients are well-established, open-source, and I assume well-written,
from my perspective, there are a couple of reasons I decided not to use them
as a starting point.  I mention them here not to criticize either project, but
to give the reader an idea where I'm coming from, and to explain the design
goals behind this project and associated work.

* YAAC is written in Java.  That's good, but ordinarily with Java I'd want
to use Maven to pull the library from Maven Central.  YAAC isn't in Maven
Central, and although I could build it locally, it doesn't look to be
structured in a Maven-friendly fashion.
* Xastir is written in 'C'.  Using the Motif (Xm) library.  I hated programming with Motif when
it was new back in 1990, never mind now.
* My goal is to provide a webapp-based client.  Xastir is a non-starter from
that perspective.
* Either of the languages above are likely to discourage community
participation.  Especially the 'C' part.
* Both Xastir and YAAC are GPL-licensed.  I'm more partial to Apache.
* I happen to be playing with 'Node.js' a lot lately.

These utilities are licensed under the Apache Software License, version 2.
In fact, if we can build a community around APRS on Node.js, I'd love to see
the project go through incubation at the ASF.

Cheers,

Greg Trasuk, VA3TSK

The phrase APRS is a registered trademark of Bob Bruninga WB4APR.
