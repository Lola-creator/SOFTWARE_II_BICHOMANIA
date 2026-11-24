import { useEffect, useState } from "react";
import { encuestasApi } from "../../infraestructura/encuestasApi";
import { sesion } from "../../../../compartido/infraestructura/sesion";

const ESTILO_BOTON_LISTA = {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    background: "none",
    border: "none",
    borderRadius: "6px",
    font: "inherit",
    color: "inherit",
    textAlign: "inherit",
    cursor: "pointer"
};

export default function ResponderEncuestas() {
    const [encuestas, setEncuestas] = useState([]);
    const [seleccionada, setSeleccionada] = useState(null);
    const [detalles, setDetalles] = useState([]);

    const idCliente = sesion.idCliente();

    useEffect(() => {
        cargarEncuestas();
    }, []);


    const cargarEncuestas = async () => {
        const encuestasActivas = await encuestasApi.activas();

        const filtradas = [];

        for (const e of encuestasActivas) {
            const data = await encuestasApi.yaVoto(idCliente, e.id_encuesta);

            if (!data.yaVoto) {
                filtradas.push(e);
            }
        }

        setEncuestas(filtradas);
    };


    const seleccionarEncuesta = async (encuesta) => {
        setSeleccionada(encuesta);

        setDetalles(await encuestasApi.detalles(encuesta.id_encuesta));
    };


    const votar = async (detalle) => {
        try {
            await encuestasApi.votar(idCliente, seleccionada.id_encuesta, detalle.id_detalle);
        } catch (err) {
            alert(err.message);
            return;
        }

        setEncuestas(encuestas.filter(e => e.id_encuesta !== seleccionada.id_encuesta));

        setSeleccionada(null);

        alert("¡Voto registrado!");
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Encuestas Disponibles</h2>

            {encuestas.length === 0 && seleccionada === null && (
                <p>No tienes encuestas disponibles para responder.</p>
            )}

            {seleccionada === null ? (
                <ul>
                    {encuestas.map(e => (
                        <li
                            key={e.id_encuesta}
                            style={{
                                marginBottom: "10px",
                                border: "1px solid #ccc",
                                borderRadius: "6px"
                            }}
                        >
                            <button
                                type="button"
                                style={{ ...ESTILO_BOTON_LISTA, padding: "10px" }}
                                onClick={() => seleccionarEncuesta(e)}
                            >
                                <strong>{e.descripcion}</strong>
                                <br />
                                <small>{e.fecha_inicio} → {e.fecha_fin}</small>
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <div>
                    <h3>{seleccionada.descripcion}</h3>

                    <button onClick={() => setSeleccionada(null)}>
                        Volver
                    </button>

                    <ul>
                        {detalles.map(d => (
                            <li
                                key={d.id_detalle}
                                style={{
                                    marginTop: "10px",
                                    border: "1px solid #aaa",
                                    borderRadius: "6px"
                                }}
                            >
                                <button
                                    type="button"
                                    style={{ ...ESTILO_BOTON_LISTA, padding: "12px" }}
                                    onClick={() => votar(d)}
                                >
                                    <strong>{d.opcion_equipo}</strong> – {d.opcion_liga}
                                    <br />
                                    <small>{d.categoria}</small>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
