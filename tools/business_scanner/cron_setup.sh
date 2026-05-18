#!/bin/bash
# Add this line to your crontab (crontab -e) on Raspberry Pi:
# 0 9 * * * cd /home/Lidico/maori_stock_bot && python tools/business_scanner/main.py >> tools/business_scanner/logs/scanner.log 2>&1
echo "Add this to crontab -e:"
echo "0 9 * * * cd /home/Lidico/maori_stock_bot && python tools/business_scanner/main.py >> tools/business_scanner/logs/scanner.log 2>&1"
