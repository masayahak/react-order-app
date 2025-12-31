'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface SuggestTextBoxProps<T> {
  value: string;
  placeholder?: string;
  onValueChange: (value: string) => void;
  onSelect: (item: T) => void;
  fetchSuggestions: (keyword: string) => Promise<T[]>;
  displayValueSelector: (item: T) => string;
  startSearchChars?: number; // 何文字以上で検索開始するか（0なら全件表示）
  debounceMs?: number; // デバウンス時間（ミリ秒）
  className?: string;
  id?: string;
}

export default function SuggestTextBox<T>({
  value,
  placeholder,
  onValueChange,
  onSelect,
  fetchSuggestions,
  displayValueSelector,
  startSearchChars = 0,
  debounceMs = 300,
  className = '',
  id,
}: SuggestTextBoxProps<T>) {
  const [suggestions, setSuggestions] = useState<T[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isListClickedRef = useRef(false);

  // ドロップダウンの位置を更新
  const updateDropdownPosition = useCallback(() => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, []);

  // スクロールやリサイズ時に位置を更新
  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
      window.addEventListener('scroll', updateDropdownPosition, true);
      window.addEventListener('resize', updateDropdownPosition);
      return () => {
        window.removeEventListener('scroll', updateDropdownPosition, true);
        window.removeEventListener('resize', updateDropdownPosition);
      };
    }
  }, [isOpen, updateDropdownPosition]);

  const loadSuggestions = useCallback(
    async (keyword: string) => {
      if (startSearchChars > 0 && keyword.length < startSearchChars) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const items = await fetchSuggestions(keyword);
        setSuggestions(items);
        if (items.length > 0) {
          setIsOpen(true);
          updateDropdownPosition();
        }
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchSuggestions, startSearchChars, updateDropdownPosition]
  );

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // フォーカスがない場合は検索しない
    if (document.activeElement !== inputRef.current) {
      return;
    }

    if (startSearchChars === 0 && value === '') {
      // 全件表示モードで空文字の場合は即座にロード
      loadSuggestions('');
    } else {
      debounceTimerRef.current = setTimeout(() => {
        loadSuggestions(value);
      }, debounceMs);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [value, loadSuggestions, debounceMs, startSearchChars]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onValueChange(newValue);
    setSelectedIndex(-1);
    
    // 入力が空の場合はリストを閉じる
    if (!newValue && startSearchChars > 0) {
      setIsOpen(false);
      setSuggestions([]);
    }
  };

  const handleFocus = () => {
    updateDropdownPosition();
    if (suggestions.length > 0) {
      setIsOpen(true);
    } else if (startSearchChars === 0) {
      loadSuggestions(value);
    }
  };

  const handleBlur = () => {
    // リストクリック時は閉じない
    if (!isListClickedRef.current) {
      setTimeout(() => {
        setIsOpen(false);
        setSelectedIndex(-1);
      }, 200);
    }
    isListClickedRef.current = false;
  };

  const handleSelect = (item: T) => {
    onSelect(item);
    onValueChange(displayValueSelector(item));
    setIsOpen(false);
    setSelectedIndex(-1);
    setSuggestions([]);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        setSuggestions([]);
        inputRef.current?.blur();
        break;
    }
  };

  // ドロップダウンリストのコンテンツ
  const dropdownContent = isOpen && typeof window !== 'undefined' ? createPortal(
    <div
      ref={listRef}
      className="bg-white border border-gray-300 rounded shadow-lg overflow-y-auto"
      style={{
        position: 'absolute',
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        width: dropdownPosition.width,
        zIndex: 99999,
        maxHeight: '300px',
      }}
      onMouseDown={() => {
        isListClickedRef.current = true;
      }}
    >
      {isLoading ? (
        <div className="p-2 text-center text-gray-500">読み込み中...</div>
      ) : suggestions.length === 0 ? (
        <div className="p-2 text-center text-gray-500">該当なし</div>
      ) : (
        suggestions.map((item, index) => (
          <button
            key={index}
            type="button"
            className={`w-full text-left px-3 py-2 hover:bg-blue-50 ${
              index === selectedIndex ? 'bg-blue-100' : ''
            }`}
            style={{ display: 'block', width: '100%', textAlign: 'left' }}
            onClick={() => handleSelect(item)}
          >
            {displayValueSelector(item)}
          </button>
        ))
      )}
    </div>,
    document.body
  ) : null;

  return (
    <div className="position-relative w-100">
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={value}
        onChange={handleInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`form-control ${className}`}
        autoComplete="off"
      />
      {dropdownContent}
    </div>
  );
}
