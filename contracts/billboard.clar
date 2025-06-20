;; error constants
(define-constant ERR_STX_TRANSFER u0)

;; data vars
(define-data-var billboard-message (string-utf8 500) u"Hello world!")
(define-data-var price uint u100)

;;public functions
(define-read-only (get-message) 
    (var-get billboard-message)
)

(define-read-only (get-price) 
    (var-get price)
)

(define-public (set-message (message (string-utf8 500)))
    (let ((cur-price (var-get price))
          (new-price (+ cur-price u10)))

        ;; pay the contract
        (unwrap! (stx-transfer? cur-price tx-sender (as-contract tx-sender)) (err ERR_STX_TRANSFER))

        ;; update the billboard's message
        (var-set billboard-message message)

        ;; update the price
        (var-set price new-price)

        ;; return the updated price
        (ok new-price)
    )
)