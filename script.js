'use strict';

angular.module('ydsApp', [])
.controller('YdsController', function() {
    var vm = this;
    vm.currentImage = 0;
    vm.selectedText = -1;
    vm.isContentEditable = false;
    vm.slides = [
        {
            imageUrl:'http://thumb7.shutterstock.com/display_pic_with_logo/64260/292334429/stock-photo-hospital-profession-people-and-medicine-concept-group-of-happy-doctors-at-hospital-292334429.jpg',
            text: [
                {size: 50, top: 30, left: 30, color: 'green', content: 'We\'re very smart.'},
                {size: 50, top: 300, left: 30, color: 'green', content: 'But we hate Harold!'}
            ]
        },
        {
            imageUrl:'http://thumb9.shutterstock.com/display_pic_with_logo/1357345/139099052/stock-photo-happy-doctor-man-showing-heart-shape-139099052.jpg',
            text: [
                {size: 50, top: 30, left: 30, color: 'green', content: 'My heart is this big.'},
                {size: 50, top: 300, left: 30, color: 'green', content: 'But I still fucking hate Harold!'}
            ]
        }
    ]; 
    vm.setCurrentImage = function(idx) {
        vm.selectedText = -1;
        vm.currentImage = idx;
    };
    vm.editText = function(idx, e) {
        $(e.target).draggable({
            containment: 'parent'
        }).on('dragstop', function() {
            var top = e.target.style.top.replace('px', '');
            var left = e.target.style.left.replace('px', '');
            vm.slides[vm.currentImage].text[vm.selectedText].top = top;
            vm.slides[vm.currentImage].text[vm.selectedText].left = left;
        });
        vm.selectedText = idx;
    };
    vm.clearSelection = function(e) {
        if(e.target.className==='current-image') {
            vm.selectedText = -1;
            vm.isContentEditable = false;
            $('.ui-draggable').draggable('destroy');
        }
    };
    vm.isColor = function(c) {
        if(vm.selectedText > -1) {
            return vm.slides[vm.currentImage].text[vm.selectedText].color === c;
        }
        return false;
    };
    vm.setColor = function(c) {
        vm.slides[vm.currentImage].text[vm.selectedText].color = c;
    };

    return vm;
});
