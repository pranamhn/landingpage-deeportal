#!/bin/bash
kill $(cat /tmp/deeportal.pids) 2>/dev/null
rm /tmp/deeportal.pids 2>/dev/null
echo "All Deeportal services stopped."
