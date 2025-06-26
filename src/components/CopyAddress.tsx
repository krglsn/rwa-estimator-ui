import {useState} from 'preact/hooks';

type CopyableAddressProps = {
    address: string;
};

export function CopyableAddress({address}: CopyableAddressProps) {
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
        <div>
            <div className="flex items-center gap-2">
                <span>{address}</span>
                <button
                    onClick={handleCopy}
                    className="btn btn-xs btn-outline btn-soft"
                >
                    {copied ? '✅' : '📋'}
                </button>
            </div>
        </div>
    );
}
