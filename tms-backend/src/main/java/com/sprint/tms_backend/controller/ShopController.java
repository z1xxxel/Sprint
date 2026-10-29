package com.sprint.tms_backend.controller;

import com.sprint.tms_backend.DTO.*;
import com.sprint.tms_backend.model.Category;
import com.sprint.tms_backend.model.Discount;
import com.sprint.tms_backend.model.Product;
import com.sprint.tms_backend.service.ShopService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/shop")
@RequiredArgsConstructor
public class ShopController {

    private final ShopService shopService;

    // ==========================================
    // === КАТЕГОРИИ ===
    // ==========================================

    @PostMapping("/categories")
    public ResponseEntity<Category> createCategory(
            @RequestParam Long actorId,
            @RequestBody CreateCategoryRequest request) {
        return new ResponseEntity<>(shopService.createCategory(actorId, request), HttpStatus.CREATED);
    }

    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(shopService.getAllCategories());
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<Category> updateCategory(
            @PathVariable Long id,
            @RequestParam Long actorId,
            @RequestBody CreateCategoryRequest request) {
        return ResponseEntity.ok(shopService.updateCategory(id, actorId, request));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<String> deleteCategory(
            @PathVariable Long id,
            @RequestParam Long actorId) {
        shopService.deleteCategory(id, actorId);
        return ResponseEntity.ok("Категория удалена");
    }

    @GetMapping("/categories/{categoryId}/products")
    public ResponseEntity<List<ProductResponseDTO>> getProductsByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(shopService.getProductsByCategory(categoryId));
    }

    // ==========================================
    // === ТОВАРЫ ===
    // ==========================================

    @PostMapping("/products")
    public ResponseEntity<ProductResponseDTO> createProduct(
            @RequestParam Long actorId,
            @RequestBody CreateProductRequest request) {
        return new ResponseEntity<>(shopService.createProduct(actorId, request), HttpStatus.CREATED);
    }

    @GetMapping("/products")
    public ResponseEntity<List<ProductResponseDTO>> getAllProducts() {
        return ResponseEntity.ok(shopService.getAllProducts());
    }

    @GetMapping("/admin/products")
    public ResponseEntity<List<ProductResponseDTO>> getAllProductsForAdmin(@RequestParam Long actorId) {
        return ResponseEntity.ok(shopService.getAllProductsForAdmin(actorId));
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<ProductResponseDTO> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(shopService.getProductById(id));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<ProductResponseDTO> updateProduct(
            @PathVariable Long id,
            @RequestParam Long actorId,
            @RequestBody CreateProductRequest request) {
        return ResponseEntity.ok(shopService.updateProduct(id, actorId, request));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<String> deleteProduct(
            @PathVariable Long id,
            @RequestParam Long actorId) {
        shopService.deleteProduct(id, actorId);
        return ResponseEntity.ok("Товар скрыт из каталога");
    }

    @DeleteMapping("/products/{id}/hard")
    public ResponseEntity<String> hardDeleteProduct(
            @PathVariable Long id,
            @RequestParam Long actorId) {
        shopService.hardDeleteProduct(id, actorId);
        return ResponseEntity.ok("Товар удален навсегда");
    }

    @PostMapping("/products/{id}/restock")
    public ResponseEntity<String> restockProduct(
            @PathVariable Long id,
            @RequestParam Long actorId,
            @RequestBody RestockRequest request) {
        shopService.restockProduct(id, actorId, request.amount(), request.variantId());
        return ResponseEntity.ok("Остаток пополнен");
    }

    @PostMapping("/products/{productId}/write-off")
    public ResponseEntity<String> writeOffStock(
            @PathVariable Long productId,
            @RequestParam Long actorId,
            @RequestBody WriteOffStockRequest request) {
        shopService.writeOffStock(productId, actorId, request);
        return ResponseEntity.ok("Списание успешно выполнено");
    }

    @GetMapping("/products/{id}/movements")
    public ResponseEntity<List<ProductMovementDTO>> getProductMovements(
            @PathVariable Long id,
            @RequestParam Long actorId) {
        return ResponseEntity.ok(shopService.getProductMovements(id, actorId));
    }

    @GetMapping("/products/search")
    public ResponseEntity<List<ProductResponseDTO>> search(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        return ResponseEntity.ok(shopService.searchProducts(query, categoryId, minPrice, maxPrice, sortBy, sortDir));
    }

    // ==========================================
    // === СКИДКИ ===
    // ==========================================

    @PostMapping("/products/{productId}/discount")
    public ResponseEntity<Discount> createDiscount(
            @PathVariable Long productId,
            @RequestParam Long actorId,
            @RequestBody CreateDiscountRequest request) {
        return new ResponseEntity<>(shopService.createDiscount(productId, actorId, request), HttpStatus.CREATED);
    }

    @DeleteMapping("/products/{id}/discount")
    public ResponseEntity<String> deleteDiscount(
            @PathVariable Long id,
            @RequestParam Long actorId) {
        shopService.deleteDiscount(id, actorId);
        return ResponseEntity.ok("Скидка удалена");
    }

    // ==========================================
    // === ПОКУПКА ===
    // ==========================================

    @PostMapping("/purchase")
    public ResponseEntity<OrderResponseDTO> purchase(
            @RequestBody PurchaseRequest request,
            @RequestParam(required = false) String comment) { // <-- Добавлен комментарий
        return new ResponseEntity<>(shopService.purchaseProduct(request, comment), HttpStatus.CREATED);
    }

    @PostMapping("/purchase-bulk")
    public ResponseEntity<List<OrderResponseDTO>> purchaseBulk(
            @RequestBody List<PurchaseRequest> requests,
            @RequestParam(required = false) String comment) { // <-- Добавлен комментарий
        return new ResponseEntity<>(shopService.purchaseBulk(requests, comment), HttpStatus.CREATED);
    }

    // ==========================================
    // === ЗАКАЗЫ ===
    // ==========================================

    @GetMapping("/orders/{userId}")
    public ResponseEntity<List<OrderResponseDTO>> getUserOrders(@PathVariable Long userId) {
        return ResponseEntity.ok(shopService.getUserOrders(userId));
    }

    @GetMapping("/orders/pending")
    public ResponseEntity<List<OrderResponseDTO>> getPendingOrders(@RequestParam Long actorId) {
        return ResponseEntity.ok(shopService.getPendingOrders(actorId));
    }

    @GetMapping("/orders/all")
    public ResponseEntity<List<OrderResponseDTO>> getAllOrders(@RequestParam Long actorId) {
        return ResponseEntity.ok(shopService.getAllOrders(actorId));
    }

    @PutMapping("/orders/{orderId}/approve")
    public ResponseEntity<OrderResponseDTO> approveOrder(
            @PathVariable Long orderId,
            @RequestParam Long actorId,
            @RequestParam(required = false) String comment) {
        return ResponseEntity.ok(shopService.approveOrder(actorId, orderId, comment));
    }

    @PutMapping("/orders/{orderId}/reject")
    public ResponseEntity<OrderResponseDTO> rejectOrder(
            @PathVariable Long orderId,
            @RequestParam Long actorId,
            @RequestParam String reason) {
        return ResponseEntity.ok(shopService.rejectOrder(actorId, orderId, reason));
    }

    @PutMapping("/orders/{orderId}/complete")
    public ResponseEntity<OrderResponseDTO> completeOrder(
            @PathVariable Long orderId,
            @RequestParam Long actorId) {
        return ResponseEntity.ok(shopService.completeOrder(actorId, orderId));
    }

    // ==========================================
    // === ИЗБРАННОЕ ===
    // ==========================================

    @PostMapping("/favorites/{productId}")
    public ResponseEntity<String> addFavorite(@PathVariable Long productId, @RequestParam Long userId) {
        shopService.addFavorite(userId, productId);
        return ResponseEntity.ok("Добавлено в избранное");
    }

    @DeleteMapping("/favorites/{productId}")
    public ResponseEntity<String> removeFavorite(@PathVariable Long productId, @RequestParam Long userId) {
        shopService.removeFavorite(userId, productId);
        return ResponseEntity.ok("Удалено из избранного");
    }

    @GetMapping("/favorites")
    public ResponseEntity<List<ProductResponseDTO>> getFavorites(@RequestParam Long userId) {
        return ResponseEntity.ok(shopService.getFavorites(userId));
    }

    // ==========================================
    // === ОТЗЫВЫ ===
    // ==========================================

    @PostMapping("/products/{productId}/reviews")
    public ResponseEntity<String> addReview(@PathVariable Long productId, @RequestBody ReviewRequest request) {
        shopService.addReview(request.userId(), productId, request.rating(), request.comment());
        return ResponseEntity.ok("Отзыв добавлен");
    }

    @GetMapping("/products/{productId}/reviews")
    public ResponseEntity<List<ReviewResponseDTO>> getReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(shopService.getReviews(productId));
    }

    // ==========================================
    // === ЛОГИ ===
    // ==========================================

    @GetMapping("/audit-logs")
    public ResponseEntity<Page<ShopAuditLogDTO>> getAuditLogs(
            @RequestParam Long actorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(shopService.getAuditLogs(actorId, page, size));
    }
}