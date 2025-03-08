
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CRYPTO_OPTIONS, NETWORK_OPTIONS, DepositMethod } from '@/types/deposit-methods';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface ManageDepositMethodsFormProps {
  method: DepositMethod | null;
  isAdding: boolean;
  onSave: (methodData: Partial<DepositMethod>) => Promise<void>;
  onCancel: () => void;
  isUpdating: boolean;
}

export function ManageDepositMethodsForm({ 
  method, 
  isAdding, 
  onSave, 
  onCancel, 
  isUpdating 
}: ManageDepositMethodsFormProps) {
  const [crypto, setCrypto] = useState(method?.crypto || '');
  const [network, setNetwork] = useState(method?.network || '');
  const [depositAddress, setDepositAddress] = useState(method?.deposit_address || '');
  const [qrCodeUrl, setQrCodeUrl] = useState(method?.qr_code_url || '');
  const [isActive, setIsActive] = useState(method?.is_active !== false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!crypto || !network || !depositAddress) {
      alert('Crypto, network, and deposit address are required');
      return;
    }
    
    onSave({
      crypto,
      network,
      deposit_address: depositAddress,
      qr_code_url: qrCodeUrl || null,
      is_active: isActive
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="crypto">Cryptocurrency</Label>
          <Select
            value={crypto}
            onValueChange={setCrypto}
            disabled={isUpdating}
            required
          >
            <SelectTrigger id="crypto">
              <SelectValue placeholder="Select cryptocurrency" />
            </SelectTrigger>
            <SelectContent>
              {CRYPTO_OPTIONS.map(option => (
                <SelectItem key={option.code} value={option.code}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="network">Network</Label>
          <Select
            value={network}
            onValueChange={setNetwork}
            disabled={isUpdating}
            required
          >
            <SelectTrigger id="network">
              <SelectValue placeholder="Select network" />
            </SelectTrigger>
            <SelectContent>
              {NETWORK_OPTIONS.map(option => (
                <SelectItem key={option.code} value={option.code}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="depositAddress">Deposit Address</Label>
        <Input
          id="depositAddress"
          value={depositAddress}
          onChange={(e) => setDepositAddress(e.target.value)}
          placeholder="Enter deposit address"
          disabled={isUpdating}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="qrCodeUrl">QR Code URL (Optional)</Label>
        <Input
          id="qrCodeUrl"
          value={qrCodeUrl}
          onChange={(e) => setQrCodeUrl(e.target.value)}
          placeholder="Enter QR code URL"
          disabled={isUpdating}
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={isActive}
          onCheckedChange={setIsActive}
          disabled={isUpdating}
        />
        <Label htmlFor="isActive">Active</Label>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isUpdating}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isUpdating}
        >
          {isUpdating ? 'Saving...' : isAdding ? 'Add Method' : 'Update Method'}
        </Button>
      </div>
    </form>
  );
}

export default ManageDepositMethodsForm;
