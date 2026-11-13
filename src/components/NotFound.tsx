import { memo } from "react";
import { useNavigate } from "react-router-dom";

function NotFound() {
    const navigate = useNavigate();

    return (
        <main className="not-found">
            <div className="not-found-content">
                <h1 className="not-found-code">404</h1>

                <p className="not-found-message">
                    The page you're looking for doesn't exist.
                </p>

                <button
                    type="button"
                    className="not-found-button"
                    onClick={() => navigate(-1)}
                >
                    <span aria-hidden="true">←</span>
                    Go back
                </button>
            </div>
        </main>
    );
}

export default memo(NotFound);
