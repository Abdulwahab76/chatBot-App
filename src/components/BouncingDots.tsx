import React from "react";

function BouncingDots() {
    const [step, setStep] = React.useState(0);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setStep(s => (s + 1) % 3);   // cycle 0 → 1 → 2 → 0...
        }, 250); // speed of animation

        return () => clearInterval(interval);
    }, []);

    const dotStyle = (active: any) => ({
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        background: "white",
        margin: "0 3px",
        transition: "transform 0.2s ease",
        transform: active ? "translateY(-4px)" : "translateY(0px)"
    });

    return (
        <div style={{
            display: "flex",
            padding: "12px 12px",
            background: "#ee0c08",
            borderRadius: "10px",
            alignItems: "center",
            width: 40
        }}>
            <div style={dotStyle(step === 0)}></div>
            <div style={dotStyle(step === 1)}></div>
            <div style={dotStyle(step === 2)}></div>
        </div>
    );
}
export default BouncingDots;