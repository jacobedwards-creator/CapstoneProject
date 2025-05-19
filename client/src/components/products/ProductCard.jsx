import { Card, CardContent, Typography } from '@mui/material';

export default function ProductCard({ product }) {
  return (
    <Card sx={{ minWidth: 275, m: 2 }}>
      <CardContent>
        <Typography variant="h5">{product.name}</Typography>
        <Typography color="text.secondary">${product.price.toFixed(2)}</Typography>
        <Typography variant="body2">{product.description}</Typography>
      </CardContent>
    </Card>
  );
}