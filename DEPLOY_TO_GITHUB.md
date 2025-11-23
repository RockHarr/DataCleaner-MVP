# Subir DataCleaner a GitHub

Sigue estos pasos para inicializar el repositorio y subirlo a GitHub.

1.  **Inicializar Git**:
    ```powershell
    git init
    ```

2.  **Agregar archivos**:
    ```powershell
    git add .
    ```

3.  **Hacer el primer commit**:
    ```powershell
    git commit -m "Initial commit: DataCleaner MVP v0.1.0"
    ```

4.  **Renombrar rama a main** (opcional pero recomendado):
    ```powershell
    git branch -M main
    ```

5.  **Agregar el repositorio remoto**:
    ```powershell
    git remote add origin https://github.com/RockHarr/DataCleaner-MVP.git
    ```

6.  **Subir el código**:
    ```powershell
    git push -u origin main
    ```

> **Nota**: Si es la primera vez que usas git en este equipo, es posible que te pida credenciales de GitHub.
