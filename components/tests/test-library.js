export const TESTS = {
    "gad-7": {
        id: "gad-7",
        title: "Cuestionario de Ansiedad Generalizada (GAD-7)",
        description: "Durante las últimas 2 semanas, ¿con qué frecuencia le han molestado los siguientes problemas?",
        questions: [
            { id: "q1", text: "Sentirse nervioso/a, intranquilo/a o con los nervios de punta", type: "scale", options: ["Nunca", "Varios días", "Más de la mitad de los días", "Casi todos los días"] },
            { id: "q2", text: "No poder dejar de preocuparse o no poder controlar la preocupación", type: "scale", options: ["Nunca", "Varios días", "Más de la mitad de los días", "Casi todos los días"] },
            { id: "q3", text: "Preocuparse demasiado por diferentes cosas", type: "scale", options: ["Nunca", "Varios días", "Más de la mitad de los días", "Casi todos los días"] },
            { id: "q4", text: "Dificultad para relajarse", type: "scale", options: ["Nunca", "Varios días", "Más de la mitad de los días", "Casi todos los días"] },
            { id: "q5", text: "Estar tan inquieto/a que le cuesta quedarse quieto/a", type: "scale", options: ["Nunca", "Varios días", "Más de la mitad de los días", "Casi todos los días"] },
            { id: "q6", text: "Molestarse o irritarse fácilmente", type: "scale", options: ["Nunca", "Varios días", "Más de la mitad de los días", "Casi todos los días"] },
            { id: "q7", text: "Sentir miedo como si algo terrible fuera a pasar", type: "scale", options: ["Nunca", "Varios días", "Más de la mitad de los días", "Casi todos los días"] }
        ]
    },
    "phq-9": {
        id: "phq-9",
        title: "Cuestionario sobre la Salud del Paciente (PHQ-9)",
        description: "Durante las últimas 2 semanas, ¿con qué frecuencia le han molestado los siguientes problemas?",
        questions: [
            { id: "q1", text: "Poco interés o placer en hacer cosas", type: "scale", options: ["Nunca", "Varios días", "Más de la mitad de los días", "Casi todos los días"] },
            { id: "q2", text: "Se ha sentido decaído/a, deprimido/a o sin esperanzas", type: "scale", options: ["Nunca", "Varios días", "Más de la mitad de los días", "Casi todos los días"] },
            { id: "q3", text: "Dificultad para quedarse o permanecer dormido/a, o ha dormido demasiado", type: "scale", options: ["Nunca", "Varios días", "Más de la mitad de los días", "Casi todos los días"] },
            { id: "q4", text: "Se ha sentido cansado/a o con poca energía", type: "scale", options: ["Nunca", "Varios días", "Más de la mitad de los días", "Casi todos los días"] },
            { id: "q5", text: "Sin apetito o ha comido en exceso", type: "scale", options: ["Nunca", "Varios días", "Más de la mitad de los días", "Casi todos los días"] },
            { id: "q6", text: "Se ha sentido mal con usted mismo/a", type: "scale", options: ["Nunca", "Varios días", "Más de la mitad de los días", "Casi todos los días"] },
            { id: "q7", text: "Ha tenido dificultad para concentrarse en ciertas actividades", type: "scale", options: ["Nunca", "Varios días", "Más de la mitad de los días", "Casi todos los días"] },
            { id: "q8", text: "Se ha movido o hablado tan lentamente que otras personas podrían haberlo notado", type: "scale", options: ["Nunca", "Varios días", "Más de la mitad de los días", "Casi todos los días"] },
            { id: "q9", text: "Pensamientos de que estaría mejor muerto/a o de lastimarse de alguna manera", type: "scale", options: ["Nunca", "Varios días", "Más de la mitad de los días", "Casi todos los días"] }
        ]
    },
    "sms-6": {
        id: "sms-6",
        title: "Escala de Motivación Situacional (SMS-6)",
        description: "¿Por qué estás realizando esta actividad ahora mismo?",
        questions: [
            { id: "q1", text: "Porque creo que esta actividad es interesante", type: "scale", options: ["Totalmente en desacuerdo", "En desacuerdo", "Ligeramente en desacuerdo", "Ligeramente de acuerdo", "De acuerdo", "Totalmente de acuerdo"] },
            { id: "q2", text: "Porque lo hago por mi propio bien", type: "scale", options: ["Totalmente en desacuerdo", "En desacuerdo", "Ligeramente en desacuerdo", "Ligeramente de acuerdo", "De acuerdo", "Totalmente de acuerdo"] },
            { id: "q3", text: "Porque se supone que debo hacerlo", type: "scale", options: ["Totalmente en desacuerdo", "En desacuerdo", "Ligeramente en desacuerdo", "Ligeramente de acuerdo", "De acuerdo", "Totalmente de acuerdo"] },
            { id: "q4", text: "Puede que haya buenas razones, pero personalmente no veo ninguna", type: "scale", options: ["Totalmente en desacuerdo", "En desacuerdo", "Ligeramente en desacuerdo", "Ligeramente de acuerdo", "De acuerdo", "Totalmente de acuerdo"] },
            { id: "q5", text: "Porque me siento bien cuando hago esta actividad", type: "scale", options: ["Totalmente en desacuerdo", "En desacuerdo", "Ligeramente en desacuerdo", "Ligeramente de acuerdo", "De acuerdo", "Totalmente de acuerdo"] },
            { id: "q6", text: "Porque es algo que tengo que hacer", type: "scale", options: ["Totalmente en desacuerdo", "En desacuerdo", "Ligeramente en desacuerdo", "Ligeramente de acuerdo", "De acuerdo", "Totalmente de acuerdo"] }
        ]
    }
};
