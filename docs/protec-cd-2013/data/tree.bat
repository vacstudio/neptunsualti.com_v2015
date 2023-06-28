
set Quelle="C:\_Projekte\protec\cd1-cd\data"


Set DateiFilter=index.php
for /r %Quelle% %%i in (%DateiFilter%) do rename %%i index.html




