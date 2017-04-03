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

# What Can You Do With This Library?

This library is intended as a building block for applications that use APRS, but
includes a few utilities as well.  Longer term, the utilities that prove useful
will be split out into separate projects that include 'utils-for-aprs' as a
dependency, but for now, they're here, and they're useful for testing the library's
functionality.

Briefly, the library includes a few things:

## Endpoints For KISS Frame Devices

An Endpoint is an interface between JavaScript in Node and some external device,
like a TNC or a DireWolf sound-card interface.

There are three endpoint classes provided:  
* _SerialPortKISSFrameEndpoint_ - This endpoint attaches to a serial-port TNC,
including a TNC connected through a USB-Serial converter.  
* _SocketKISSFrameEndpoint_ - This endpoint attaches to KISS-over-TCP/IP devices
like DireWolf's KISS TNC Network option on port 8001 (not the AWGPE interface).  
* _ServerSocketKISSFrameEndpoint_ - This endpoint establishes a KISS-over-TCP _server_,
much the same way that DireWolf establishes a server on port 8001.
Clients that understand KISS-over-TCP (like APRSIS32, YAAC, or APRX) can connect to this
server port.  The server can accept an unlimited number of connections at once, and
each connection is available separately to the JavaScript code.

Each endpoint provides one or more 'KISSConnection' objects to your JavaScript code.
Your code can listen for KISS frames coming in to the connection from the outside,
device and send KISS frames out the connection to the device.

## APRS Info Packet Utilities

There is a utility function, 'APRSInfoParser()', that takes KISS frames and decodes
both the AX25 and APRS Info portions of them into JavaScript objects.  As well,
there are a few useful utility functions, for instance to convert an array of
callsign objects in a path to a TNC2-style path string for output and display.

## Utilities and Tests

The following scripts can be run from the command line.  The source code for each
of them gives some idea of how to use the 'utils-for-aprs' library.

* _sharePortToTCP_  - Connects to a serial-connected tnc and establishes a server
socket, allowing more than one client to share the TNC and radio.  In addition to
receiving packets from the radio, each client also receives any packets that were
sent by other clients.  
    node sharePortToTCP /dev/ttyUSB0 8001  
* _monitorTCP-APRS_ - Acts as a client to a server endpoint.  It displays any
packets that are recieved, allowing you to monitor an RF connection easily.  
    node monitorTCP-APRS raspberrypi:8001  
* _monitorTCPServer-APRS_ - Sets up a server endpoint that can be connected to
by a client like APRSIS32, YAAC, or APRX, so you can observe packets sent by a
client.  
    node monitorTCPServer-APRS 8001  
* There are a few other scripts at the top level of the project folder, but the
ones listed are the major ones.

## Getting Started

To experiment with the utilities and work on the library code, do the following:  
1 - Install node.js, as per [The node website](https://nodejs.org/).  
2 - Checkout the project folder as follows:  
    git clone https://github.com/trasukg/utils-for-aprs.git  
2 - 'cd' into the 'utils-for-aprs' folder.   
3 - Install the required npm packages  
    npm install  
4 - Run the serial interface with  
    node sharePortToTCP <serial-device> <port>  
5 - In a different terminal window, run the monitor:  
    node monitorTCP-APRS localhost:<port>

Enjoy!

This library and utilities are licensed under the Apache Software License, version 2.
In fact, if we can build a community around APRS on Node.js, I'd love to see
the project go through incubation at the ASF.

Cheers,

Greg Trasuk, VA3TSK

The phrase APRS is a registered trademark of Bob Bruninga WB4APR.

# Release Notes

2.0.0 - Nov 11, 2016 - Endpoints are working as is port sharing and monitoring  
2.1.0 - Jan 6, 2017 - AddressBuilder and KISSFrameBuilder let you construct
KISS frames for transmittal.  
2.1.1 - Fixed a minor format error in this README file.  
2.2.1 - Added support for Browserify and Web Socket endpoints.  
2.2.2 - Added required dependency on 'ws'.  
2.2.3 - Added dependency on 'bluebird'  
