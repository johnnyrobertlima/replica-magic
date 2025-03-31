
import { useState, useEffect } from 'react';
import { CollectionRecord } from './types/financialTypes';

interface UseCollectionStatusProps {
  userId?: string;
  userName?: string;
}

export const useCollectionStatus = ({ userId, userName = "Usuário" }: UseCollectionStatusProps) => {
  const [collectedClients, setCollectedClients] = useState<string[]>([]);
  const [collectionRecords, setCollectionRecords] = useState<CollectionRecord[]>([]);
  const [showCollectedOnly, setShowCollectedOnly] = useState(false);

  // Load collection status from localStorage on mount
  useEffect(() => {
    const savedCollectedClients = localStorage.getItem('bluebay_collected_clients');
    const savedCollectionRecords = localStorage.getItem('bluebay_collection_records');
    
    if (savedCollectedClients) {
      try {
        setCollectedClients(JSON.parse(savedCollectedClients));
      } catch (error) {
        console.error('Error parsing collected clients:', error);
      }
    }
    
    if (savedCollectionRecords) {
      try {
        setCollectionRecords(JSON.parse(savedCollectionRecords));
      } catch (error) {
        console.error('Error parsing collection records:', error);
      }
    }
  }, []);

  // Save to localStorage when collection state changes
  useEffect(() => {
    localStorage.setItem('bluebay_collected_clients', JSON.stringify(collectedClients));
    localStorage.setItem('bluebay_collection_records', JSON.stringify(collectionRecords));
  }, [collectedClients, collectionRecords]);

  const handleCollectionStatusChange = (clientCode: string, clientName: string, status: string) => {
    // Add to collected clients if not already there
    if (!collectedClients.includes(clientCode)) {
      setCollectedClients(prev => [...prev, clientCode]);
      
      // Add a collection record
      const newRecord: CollectionRecord = {
        clientCode,
        clientName,
        collectedBy: userName || 'Usuário',
        collectionDate: new Date(),
        status
      };
      
      setCollectionRecords(prev => [...prev, newRecord]);
    }
  };

  const toggleShowCollected = () => {
    setShowCollectedOnly(prev => !prev);
  };

  const resetClientCollectionStatus = (clientCode: string) => {
    setCollectedClients(prev => prev.filter(code => code !== clientCode));
    setCollectionRecords(prev => prev.filter(record => record.clientCode !== clientCode));
  };

  const resetAllCollectionStatus = () => {
    setCollectedClients([]);
    setCollectionRecords([]);
  };

  return {
    collectedClients,
    collectionRecords,
    showCollectedOnly,
    handleCollectionStatusChange,
    toggleShowCollected,
    resetClientCollectionStatus,
    resetAllCollectionStatus
  };
};
