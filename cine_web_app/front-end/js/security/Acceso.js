document.addEventListener("DOMContentLoaded", () => {
    // Manejo del Formulario de Inicio de Sesión
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const correo = document.getElementById("login-email")?.value.trim();
            const contraseña = document.getElementById("login-password")?.value.trim();

            console.log("Correo enviado:", correo);
            console.log("Contraseña enviada:", contraseña);

            if (!correo || !contraseña) {
                alert("Por favor, complete todos los campos de inicio de sesión.");
                return;
            }

            try {
                const response = await fetch("http://localhost:5006/api/Auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ Correo: correo, Contraseña: contraseña }) // Nombres de campos consistentes
                });

                console.log("Estado de respuesta (Login):", response.status);

                const data = await response.json();

                if (response.ok) {
                    const nombreUsuario = data.nombre;
                    localStorage.setItem("usuario", nombreUsuario);
                    window.location.replace("/cine_web_app/front-end/views/Casa.html");
                } else {
                    const errorText = data.mensaje || "Error desconocido.";
                    alert(`Error en el inicio de sesión: ${errorText}`);
                    console.error("Error en el inicio de sesión:", errorText);
                }
            } catch (error) {
                console.error("Error en la solicitud de inicio de sesión:", error);
                alert("Ocurrió un error al intentar iniciar sesión. Por favor, inténtalo de nuevo más tarde.");
            }
        });
    } else {
        console.warn("Formulario de inicio de sesión no encontrado en el DOM.");
    }

    // Manejo del Formulario de Registro
    const registerForm = document.getElementById("register-form");
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const nombre = document.getElementById("register-name")?.value.trim();
            const correo = document.getElementById("register-email")?.value.trim();
            const contraseña = document.getElementById("register-password")?.value.trim();

            console.log("Nombre registrado:", nombre);
            console.log("Correo registrado:", correo);
            console.log("Contraseña registrada:", contraseña);

            if (!nombre || !correo || !contraseña) {
                alert("Por favor, complete todos los campos de registro.");
                return;
            }

            try {
                const response = await fetch("http://localhost:5006/api/Auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ Correo: correo, Contraseña: contraseña, Nombre: nombre })
                });

                console.log("Estado de respuesta (Register):", response.status);

                const data = await response.json();

                if (response.ok) {
                    console.log("Registro exitoso:", data.mensaje);
                    alert("Usuario registrado exitosamente. Ahora puedes iniciar sesión.");
                    // Opcional: Limpiar el formulario de registro
                    registerForm.reset();
                } else {
                    const errorText = data.mensaje || "Error desconocido.";
                    alert(`Error en el registro: ${errorText}`);
                    console.error("Error en el registro:", errorText);
                }
            } catch (error) {
                console.error("Error en la solicitud de registro:", error);
                alert("Ocurrió un error al intentar registrar el usuario. Por favor, inténtalo de nuevo más tarde.");
            }
        });
    } else {
        console.warn("Formulario de registro no encontrado en el DOM.");
    }

    // Verificar si el usuario ya está logueado
    const usuario = localStorage.getItem("usuario");
    if (usuario) {
        actualizarMensajeBienvenida(usuario);
    }

    // Función para actualizar el mensaje de bienvenida (implementa según tus necesidades)
    function actualizarMensajeBienvenida(nombreUsuario) {
        // Ejemplo: Mostrar un mensaje de bienvenida en algún elemento del DOM
        const bienvenidaElement = document.getElementById("bienvenida");
        if (bienvenidaElement) {
            bienvenidaElement.textContent = `¡Bienvenido, ${nombreUsuario}!`;
        }
    }
});
