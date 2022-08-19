# sls-thumbnail-creation-lambda
# created by - grey

This is a lambda function created for image compression in XANA.
we receive an event with s3 object data. then we fetch the file.
if file doesnt exist process exits else continues.
we first analyze the uploaded image's type because different encodings need to be manipulated in very different way.
then compressing the images, trying to retain maximum quality as well as reduced size.
saves the file to default cdn serving directory for xana.
process completes.

time consumption - ~5 seconds for files larger than 1 mb.
avg memory consumption - ~350 mb