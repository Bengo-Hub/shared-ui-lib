import * as react_jsx_runtime from 'react/jsx-runtime';

interface TrackingIframeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Tracking code / order reference */
    trackingCode: string;
    /** Logistics-UI base URL */
    logisticsUiUrl?: string;
    /** Optional title override */
    title?: string;
}
declare function TrackingIframeModal({ open, onOpenChange, trackingCode, logisticsUiUrl, title, }: TrackingIframeModalProps): react_jsx_runtime.JSX.Element | null;

export { TrackingIframeModal, type TrackingIframeModalProps };
