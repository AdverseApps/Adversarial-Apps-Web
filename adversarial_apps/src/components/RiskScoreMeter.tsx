'use client';
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const GaugeComponent = dynamic(() => import("react-gauge-component"), { ssr: false });

interface Props {
    riskScore: number,
}
export const RiskScoreMeter = (props: Props) => {
    const {riskScore} = props;
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    return (
        <GaugeComponent
            type="semicircle"
            arc={{
                width: 0.2,
                padding: 0.005,
                cornerRadius: 1,
                subArcs: [
                    { limit: 1, color: '#5BE12C', tooltip: { text: 'Very Low Risk' } },  
                    { limit: 2, color: '#A8E12C', tooltip: { text: 'Low Risk' } },       
                    { limit: 3, color: '#F5CD19', tooltip: { text: 'Moderate Risk' } }, 
                    { limit: 4, color: '#F5A419', tooltip: { text: 'High Risk' } },     
                    { limit: 5, color: '#EA4228', tooltip: { text: 'Very High Risk' } },
                    { limit: 6, color: '#8B0000', tooltip: { text: 'Extreme Risk' } } 
                ]
            }}
            pointer={{
                color: '#345243',
                length: 0.80,
                width: 15
            }}
            labels={{
                valueLabel: { formatTextValue: value => (value > 5 ? '5+' : `Risk Score ${value}`) },
                tickLabels: {
                    type: 'outer',
                    defaultTickValueConfig: {
                        formatTextValue: value => {
                            if (value === 5) {
                                return "5+";
                            } else if (value == 6) {
                                return "10";
                            } else {
                                return value;
                            }
                        },
                        style: { fontSize: 12 }
                    },
                    ticks: [
                        { value: 0 }, // Middle of 0-1
                        { value: 1 }, // Middle of 1-2
                        { value: 2 }, // Middle of 2-3
                        { value: 3 }, // Middle of 3-4
                        { value: 4 }, // Middle of 4-5
                        { value: 5 }  // 5+
                    ],
                }
            }}
            value={riskScore} 
            minValue={0}
            maxValue={6} // Extends past 5 for "5+"
        />
    );
};