# Receipt Scanner Feature Specification

## Overview

The Receipt Scanner feature allows users to photograph receipts, extract item data using AI, and split expenses with friends. The feature guides users through a multi-step flow from capturing a photo to finalizing individual item splits.

---

## User Flow

### Step 1: Camera Activation

**Trigger:** User clicks the camera icon (FloatingButton).

**Behavior:**

- A full-screen camera modal opens
- The camera view occupies the entire screen
- Two controls are visible:
  - **X button** (top-left or top-right): Closes the modal and returns to the previous screen
  - **Shutter button** (bottom center): Captures the photo

![Step 1 - Camera View](step%201.png)

---

### Step 2: Photo Review

**Trigger:** User clicks the shutter button to capture a photo.

**Behavior:**

- The camera stream stops
- The captured photo is displayed in full-screen
- Two action buttons are visible:
  - **Retake (Wiederholen):** Returns to the camera view to take a new photo
  - **Continue (Weiter):** Proceeds to the next step and initiates AI processing

![Step 2 - Photo Review](step%202.png)

---

### Step 3: AI Processing (Transition)

**Trigger:** User clicks "Continue" on the photo review screen.

**Behavior:**

- The captured photo is sent to the AI parsing endpoint (`/api/parse-receipt`)
- A loading indicator is displayed while waiting for the AI response
- The AI returns structured receipt data including:
  - Store name
  - Date
  - List of items (name and price)
  - Total amount
- Upon successful parsing, the user is automatically navigated to the Receipt Overview screen

**Error Handling:**

- If parsing fails, an error message is displayed
- User can retry or retake the photo

---

### Step 4: Receipt Overview Screen

**Trigger:** AI successfully parses the receipt.

**Behavior:**

- Displays a form with pre-filled values from the AI response
- User can adjust the following fields:

| Field            | Type         | Pre-filled Value        | Description                                          |
| ---------------- | ------------ | ----------------------- | ---------------------------------------------------- |
| **Name**         | Text Input   | Store name from receipt | Name/description of the expense                      |
| **Total Amount** | Number Input | Total from receipt      | Total expense amount                                 |
| **Budget**       | Dropdown     | Default budget          | Budget category (similar to regular cash flow modal) |
| **Date**         | Date Picker  | Date from receipt       | Date of the expense                                  |

**Below the form:**

- A read-only list of detected items is displayed
- Each item shows:
  - Item name
  - Item price
- The list is **not editable** in this version

**Actions:**

- **Continue (Weiter):** Proceeds to the item-by-item split screen

![Step 3 - Receipt Overview](step%203.png)

---

### Step 5: Item Split Screen

**Trigger:** User clicks "Continue" on the Receipt Overview screen.

**Behavior:**

- Allows the user to split each item between themselves and a friend
- The screen displays:

**Top Section (Summary):**

- **Total spending amount:** The overall expense total
- **Friend's portion:** Running total of what the friend owes
- **Own portion:** Running total of what the user is paying
- **Clickable:** Tapping the header row navigates to **Step 6 (Final Overview Screen)**

**Middle Section (Current Item):**

- Displays the current item being split:
  - Item name
  - Item price
- **Navigation arrow** (right side): Advances to the next item
- **Swipe gesture:** User can swipe left/right to navigate between items

**Bottom Section (Split Controls):**

- **Slider:** Adjustable slider from 0% to 100% representing the friend's share
- **Preset buttons:** Quick selection buttons:
  - **0%** - User pays full amount
  - **50%** - Split evenly
  - **100%** - Friend pays full amount
- The slider and preset buttons are **synchronized** - selecting a preset updates the slider position and vice versa

![Step 4 - Item Split](step%204.png)

---

### Step 6: Final Overview Screen

**Trigger:** User completes splitting the last item.

**Behavior:**

- Displays a summary table of all items and their split:

| Item   | Own Amount | Friend Amount |
| ------ | ---------- | ------------- |
| Item 1 | €X.XX      | €Y.YY         |
| Item 2 | €X.XX      | €Y.YY         |
| ...    | ...        | ...           |

_(No total row is displayed since the totals are already shown at the top of the screen)_

**Item Click Navigation:**

- Each item row is **clickable**
- Tapping an item navigates back to **Step 5 (Item Split Screen)** at the position of the clicked item
- This allows users to adjust individual item splits without starting over

**Actions:**

- **Done (Fertig):** Saves the data and closes the flow

![Step 5 - Final Overview](step%205.png)

---

## Data Flow

### AI Request

```typescript
interface ParseReceiptRequest {
	imageBase64: string;
	apiKey: string;
}
```

### AI Response

```typescript
interface ParsedReceipt {
	storeName: string | null;
	date: string | null;
	items: ReceiptItem[];
	subtotal: number | null;
	tax: number | null;
	total: number | null;
}

interface ReceiptItem {
	name: string;
	quantity: number;
	unitPrice: number;
	totalPrice: number;
}
```

### Enhanced Receipt with Splits

```typescript
interface ReceiptWithSplits {
	storeName: string;
	date: string;
	total: number;
	budgetId: string;
	friendId: string;
	items: ReceiptItemWithSplit[];
}

interface ReceiptItemWithSplit {
	name: string;
	totalPrice: number;
	ownAmount: number;
	friendAmount: number;
	friendPercentage: number; // 0-100
}
```

---

## Database Changes

### Debt Table Extension

The `debt` table requires a new field:

```sql
ALTER TABLE debt ADD COLUMN receipt JSONB;
```

**Receipt JSON Structure:**

```json
{
	"storeName": "REWE",
	"date": "2026-02-18",
	"total": 45.67,
	"items": [
		{
			"name": "Milk",
			"totalPrice": 1.99,
			"ownAmount": 0.99,
			"friendAmount": 1.0
		},
		{
			"name": "Bread",
			"totalPrice": 2.5,
			"ownAmount": 1.25,
			"friendAmount": 1.25
		}
	],
	"ownTotal": 22.83,
	"friendTotal": 22.84
}
```

### Data Insertion

When the user clicks "Done (Fertig)":

1. **Cash Flow Entry:** Insert the expense into the cash flow table

   - Name: Store name or user-edited name
   - Amount: Total amount
   - Budget: Selected budget
   - Date: Receipt date or user-edited date

2. **Debt Entry:** Insert a debt record for the friend's portion
   - Amount: Friend's total portion
   - Receipt: JSON containing full receipt breakdown
   - From: Current user
   - For: Selected friend

---

## UI Components Required

### New Components

| Component                     | Description                                   |
| ----------------------------- | --------------------------------------------- |
| `ReceiptCameraView.svelte`    | Full-screen camera with X and shutter buttons |
| `ReceiptPhotoReview.svelte`   | Photo preview with retake/continue options    |
| `ReceiptOverview.svelte`      | Form with receipt details and item list       |
| `ReceiptItemSplit.svelte`     | Individual item split screen with slider      |
| `ReceiptFinalOverview.svelte` | Summary table with totals                     |
| `SplitSlider.svelte`          | Slider component with percentage presets      |

### Modified Components

| Component               | Changes                             |
| ----------------------- | ----------------------------------- |
| `CameraModal.svelte`    | Refactor to use new step-based flow |
| `ReceiptScanner.svelte` | Manage multi-step state             |

---

## State Management

The Receipt Scanner should maintain the following state throughout the flow:

```typescript
interface ReceiptScannerState {
	currentStep: 'camera' | 'review' | 'loading' | 'overview' | 'split' | 'summary';
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
```

---

## Localization

All UI text should be in German:

| Key           | German Text    |
| ------------- | -------------- |
| Retake        | Wiederholen    |
| Continue      | Weiter         |
| Done          | Fertig         |
| Name          | Name           |
| Total         | Gesamt         |
| Budget        | Budget         |
| Date          | Datum          |
| Own Amount    | Eigener Betrag |
| Friend Amount | Betrag Freund  |
| Items         | Artikel        |

---

## Accessibility

- All buttons should have appropriate `aria-label` attributes
- The slider should be keyboard-accessible
- Screen readers should announce step changes
- Error messages should be announced via `aria-live` regions

---

## Error States

| Error                | Message (German)                  | Action                                  |
| -------------------- | --------------------------------- | --------------------------------------- |
| Camera access denied | Kamerazugriff nicht möglich       | Show instructions to enable permissions |
| AI parsing failed    | Fehler beim Parsen des Kassenbons | Allow retry or manual entry             |
| Network error        | Netzwerkfehler                    | Allow retry                             |
| Invalid receipt data | Ungültige Daten                   | Allow manual adjustment                 |

---

## Future Enhancements (Out of Scope)

- Editable item list in the overview screen
- Multiple friend splits (more than one friend)
- Receipt history and re-splitting
- OCR without AI (offline mode)
- Receipt image storage
