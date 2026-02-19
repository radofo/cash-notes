export interface ReceiptItem {
	name: string;
	quantity: number;
	unitPrice: number;
	totalPrice: number;
}

export interface ParsedReceipt {
	storeName: string | null;
	date: string | null;
	items: ReceiptItem[];
	subtotal: number | null;
	tax: number | null;
	total: number | null;
}

// Enhanced types for split functionality
export interface ReceiptItemWithSplit {
	name: string;
	totalPrice: number;
	ownAmount: number;
	friendAmount: number;
	friendPercentage: number; // 0-100
}

export interface ReceiptWithSplits {
	storeName: string;
	date: string;
	total: number;
	budgetId: string;
	friendId: string;
	items: ReceiptItemWithSplit[];
	ownTotal: number;
	friendTotal: number;
}

export type ReceiptScannerStep = 'camera' | 'review' | 'loading' | 'overview' | 'split' | 'summary';

export interface ReceiptScannerState {
	currentStep: ReceiptScannerStep;
	capturedImage: string | null;
	parsedReceipt: ParsedReceipt | null;
	editedReceipt: {
		name: string;
		total: number;
		budgetId: string;
		date: string;
		friendId: string;
	};
	itemSplits: ReceiptItemWithSplit[];
	currentItemIndex: number;
}
