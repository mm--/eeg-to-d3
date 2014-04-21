#!/usr/bin/env python

import emotiv.epoc as ep
import time
import numpy as np
from socketIO_client import SocketIO

e = ep.EPOC("dummy")
# e = ep.EPOC()

import logging
logging.basicConfig(level=logging.DEBUG)

with SocketIO('localhost', 8080) as socketIO:
    while 1:
        try:
            data = e.get_sample()
            if data:
                for i,channel in enumerate(e.channel_mask):
                    print "%10s: %.2f %20s: %.2f" % (channel, data[i], "Quality", e.quality[channel])
                zipdata = dict((i, x) for i, x in zip(e.channel_mask, data))
                socketIO.emit('aaa', zipdata)
                time.sleep(0.01)
        except EPOCTurnedOffError, ete:
            print ete
        except KeyboardInterrupt, ki:
            e.disconnect()

