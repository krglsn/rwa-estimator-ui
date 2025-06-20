import {useState} from 'preact/hooks';

type CopyableAddressProps = {
    label: string;
    address: string;
};

export function CopyableAddress({label, address}: CopyableAddressProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="field">
            <span className="label">{label}:</span>
            <div className="flex items-center gap-2">
                <span className="value">{address}</span>
                <button
                    onClick={handleCopy}
                    className="btn btn-xs btn-outline btn-primary"
                >
                    {copied ? '✅' : '📋'}
                </button>
            </div>
        </div>
    );
}
