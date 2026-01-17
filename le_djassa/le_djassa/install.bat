@echo off
echo ================================
echo Installation des dependances...
echo ================================

python -m pip install --upgrade pip
python -m pip install Django
python -m pip install djangorestframework
python -m pip install djangorestframework-simplejwt
python -m pip install python-decouple

echo ================================
echo Installation terminee avec succes
echo ================================
pause
